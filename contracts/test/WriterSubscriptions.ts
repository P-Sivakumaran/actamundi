import { expect } from 'chai'
import { network } from 'hardhat'
import WriterSubscriptionsModule from '../ignition/modules/WriterSubscriptions.js'

const { ethers, ignition, networkHelpers } = await network.create()

async function deployed() {
  const [owner, reader, reader2, writerA, writerB, outsider] = await ethers.getSigners()
  const { writerSubscriptions: contract } = await ignition.deploy(WriterSubscriptionsModule)
  return { contract, owner, reader, reader2, writerA, writerB, outsider }
}

/** Sends `tx`, waits for its receipt, and returns both the receipt and the
 * exact block timestamp it mined at — accrual math depends on real elapsed
 * seconds between two specific blocks, not the nominal amount passed to
 * time.increase(), since every subsequent transaction mines its own block
 * (typically +1s) on top of whatever time.increase() already advanced. */
async function sendAndSettle(tx: Promise<any>) {
  const receipt = await (await tx).wait()
  const block = await ethers.provider.getBlock(receipt!.blockNumber)
  return { receipt: receipt!, timestamp: BigInt(block!.timestamp) }
}

function findEvent(contract: any, receipt: any, name: string) {
  return receipt.logs.map((log: any) => {
    try { return contract.interface.parseLog(log) } catch { return null }
  }).find((log: any) => log?.name === name)
}

describe('WriterSubscriptions', () => {
  it('deploys unpaused with the deployer as owner', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    expect(await f.contract.paused()).to.equal(false)
    expect(await f.contract.owner()).to.equal(f.owner.address)
  })

  it('creates a subscription, deposits balance, and rejects invalid writers', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rate = 1000n
    await expect(f.contract.connect(f.reader).subscribe(f.writerA.address, rate, { value: ethers.parseEther('1') }))
      .to.emit(f.contract, 'Subscribed').withArgs(f.reader.address, f.writerA.address, rate)
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.writer).to.equal(f.writerA.address)
    expect(sub.ratePerSecond).to.equal(rate)
    expect(sub.balance).to.equal(ethers.parseEther('1'))

    await expect(f.contract.connect(f.reader2).subscribe(ethers.ZeroAddress, rate)).to.be.revertedWith('Writer required')
    await expect(f.contract.connect(f.reader2).subscribe(f.reader2.address, rate)).to.be.revertedWith('Cannot subscribe to self')
  })

  it('accrues earnings proportional to elapsed time at the subscribed rate', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rate = 1000n
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rate, { value: ethers.parseEther('1') }))
    await networkHelpers.time.increase(100)
    const { timestamp: t1 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(rate))
    const elapsed = t1 - t0
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rate * elapsed)
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.balance).to.equal(ethers.parseEther('1') - rate * elapsed)
  })

  it('caps accrual at the remaining balance and never retroactively charges the uncovered gap once topped up', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rate = 100n
    const deposit = 500n // exhausts after 5 seconds at this rate
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rate, { value: deposit }))
    await networkHelpers.time.increase(50) // way past exhaustion
    const { timestamp: t1 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(rate)) // no-op rate change, just forces a settle
    expect(t1 - t0).to.be.greaterThan(5n) // sanity: far more elapsed than the deposit could ever cover
    expect(await f.contract.earnings(f.writerA.address)).to.equal(deposit) // capped, not elapsed*rate
    let sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.balance).to.equal(0n)
    expect(sub.lastSettled).to.equal(t1) // meter advanced to now even though underfunded

    // Top up — topUp() settles BEFORE adding the new deposit, so the settle
    // runs against the still-zero old balance: it can charge nothing (capped
    // at 0), proving the starved gap (t1 -> top-up) is never retroactively
    // charged even once funds are available again.
    await f.contract.connect(f.reader).topUp({ value: deposit })
    expect(await f.contract.earnings(f.writerA.address)).to.equal(deposit) // unchanged — the gap cost nothing
    sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.balance).to.equal(deposit) // exactly the fresh top-up, nothing silently deducted
  })

  it('treats ratePerSecond = 0 as a valid inert subscription', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    await f.contract.connect(f.reader).subscribe(f.writerA.address, 0n, { value: ethers.parseEther('1') })
    await networkHelpers.time.increase(1000)
    await f.contract.connect(f.reader).changeRate(0n)
    expect(await f.contract.earnings(f.writerA.address)).to.equal(0n)
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.balance).to.equal(ethers.parseEther('1'))
  })

  it('settles the old writer exactly up to the switch instant, then accrues to the new writer from zero', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    const rateB = 2000n
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') }))
    await networkHelpers.time.increase(100)
    const { receipt, timestamp: t1 } = await sendAndSettle(
      f.contract.connect(f.reader).subscribe(f.writerB.address, rateB, { value: ethers.parseEther('1') })
    )
    const elapsedA = t1 - t0

    const event = findEvent(f.contract, receipt, 'WriterSwitched')
    expect(event!.args.reader).to.equal(f.reader.address)
    expect(event!.args.oldWriter).to.equal(f.writerA.address)
    expect(event!.args.newWriter).to.equal(f.writerB.address)
    expect(event!.args.settledAmount).to.equal(rateA * elapsedA)

    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * elapsedA)
    expect(await f.contract.earnings(f.writerB.address)).to.equal(0n) // nothing leaked to the new writer yet

    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.writer).to.equal(f.writerB.address)
    expect(sub.ratePerSecond).to.equal(rateB)

    await networkHelpers.time.increase(50)
    const { timestamp: t2 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(rateB))
    const elapsedB = t2 - t1
    expect(await f.contract.earnings(f.writerB.address)).to.equal(rateB * elapsedB)
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * elapsedA) // writerA frozen, unaffected by post-switch accrual
  })

  it('caps the old writer settlement at the switch instant when balance ran out before the switch', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    const deposit = 2000n // exhausts after 2 seconds at rateA
    await f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: deposit })
    await networkHelpers.time.increase(100) // way past exhaustion
    const { receipt } = await sendAndSettle(
      f.contract.connect(f.reader).subscribe(f.writerB.address, 500n, { value: ethers.parseEther('1') })
    )
    const event = findEvent(f.contract, receipt, 'WriterSwitched')
    expect(event!.args.settledAmount).to.equal(deposit) // capped at the full original deposit, not elapsed*rateA
    expect(await f.contract.earnings(f.writerA.address)).to.equal(deposit)
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.writer).to.equal(f.writerB.address)
    expect(sub.balance).to.equal(ethers.parseEther('1')) // only the new deposit — old balance was fully drained to writerA
  })

  it('treats a same-writer resubscribe as a rate change, settling the gap at the OLD rate first', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') }))
    await networkHelpers.time.increase(100)
    const newRate = 5000n
    const { receipt, timestamp: t1 } = await sendAndSettle(
      f.contract.connect(f.reader).subscribe(f.writerA.address, newRate, { value: 0n })
    )
    const elapsed = t1 - t0
    expect(findEvent(f.contract, receipt, 'RateChanged')).to.not.equal(undefined)
    expect(findEvent(f.contract, receipt, 'WriterSwitched')).to.equal(undefined)
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * elapsed) // gap settled at the OLD rate
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.ratePerSecond).to.equal(newRate)

    const earningsBeforeSecondGap = await f.contract.earnings(f.writerA.address)
    await networkHelpers.time.increase(10)
    const { timestamp: t2 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(newRate))
    const secondGap = t2 - t1
    expect(await f.contract.earnings(f.writerA.address)).to.equal(earningsBeforeSecondGap + newRate * secondGap) // new rate applies going forward
  })

  it('topUp requires an active subscription', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    await expect(f.contract.connect(f.reader).topUp({ value: 100n })).to.be.revertedWith('No active subscription')
  })

  it('changeRate settles at the old rate before applying the new one', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') }))
    await networkHelpers.time.increase(60)
    const { timestamp: t1 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(9000n))
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * (t1 - t0))
    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.ratePerSecond).to.equal(9000n)

    await expect(f.contract.connect(f.reader2).changeRate(1n)).to.be.revertedWith('No active subscription')
  })

  it('unsubscribe settles final accrual, leaves balance reclaimable, and stops further accrual', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    const { timestamp: t0 } = await sendAndSettle(f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') }))
    await networkHelpers.time.increase(60)
    const { receipt, timestamp: t1 } = await sendAndSettle(f.contract.connect(f.reader).unsubscribe())
    const elapsed = t1 - t0

    const event = findEvent(f.contract, receipt, 'Unsubscribed')
    expect(event!.args.settledAmount).to.equal(rateA * elapsed)
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * elapsed)

    const sub = await f.contract.subscriptions(f.reader.address)
    expect(sub.writer).to.equal(ethers.ZeroAddress)
    expect(sub.balance).to.equal(ethers.parseEther('1') - rateA * elapsed)

    await networkHelpers.time.increase(1000) // no active writer — should not accrue further
    await expect(f.contract.connect(f.reader).changeRate(1n)).to.be.revertedWith('No active subscription')
    expect(await f.contract.earnings(f.writerA.address)).to.equal(rateA * elapsed) // unchanged

    await expect(f.contract.connect(f.reader).unsubscribe()).to.be.revertedWith('No active subscription')
  })

  it('reclaim returns unspent balance to the reader, settling first, even while paused', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    await f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') })
    await networkHelpers.time.increase(60)

    // Reclaim while still subscribed — must settle first, so the writer gets
    // their share before the remainder is handed back.
    const subBefore = await f.contract.subscriptions(f.reader.address)
    await expect(f.contract.connect(f.reader).reclaim(100n))
      .to.changeEtherBalances(ethers, [f.contract, f.reader], [-100n, 100n])
    const subAfter = await f.contract.subscriptions(f.reader.address)
    expect(subAfter.balance).to.be.lessThan(subBefore.balance - 100n) // settlement consumed more than just the 100n reclaim

    await expect(f.contract.connect(f.reader).reclaim(ethers.parseEther('999'))).to.be.revertedWith('Insufficient balance')

    // Works after unsubscribe.
    await f.contract.connect(f.reader).unsubscribe()
    const remaining = (await f.contract.subscriptions(f.reader.address)).balance
    await expect(f.contract.connect(f.reader).reclaim(remaining))
      .to.changeEtherBalances(ethers, [f.contract, f.reader], [-remaining, remaining])

    // Works while the contract is paused. Rate 0 so settlement can never eat
    // into the deposit regardless of how much real time elapses before reclaim.
    await f.contract.connect(f.reader2).subscribe(f.writerA.address, 0n, { value: 500n })
    await f.contract.connect(f.owner).pause()
    await expect(f.contract.connect(f.reader2).reclaim(500n))
      .to.changeEtherBalances(ethers, [f.contract, f.reader2], [-500n, 500n])
  })

  it('withdraw lets a writer pull their earnings straight to their own wallet', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    await f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') })
    await networkHelpers.time.increase(60)
    await f.contract.connect(f.reader).changeRate(rateA) // force a settle
    const earned = await f.contract.earnings(f.writerA.address)
    expect(earned).to.be.greaterThan(0n)
    expect(await f.contract.pendingEarnings(f.writerA.address)).to.equal(earned)

    await expect(f.contract.connect(f.writerA).withdraw(earned))
      .to.changeEtherBalances(ethers, [f.contract, f.writerA], [-earned, earned])
    expect(await f.contract.earnings(f.writerA.address)).to.equal(0n)

    await expect(f.contract.connect(f.writerA).withdraw(1n)).to.be.revertedWith('Insufficient earnings')
  })

  it('gates pause/unpause to the owner and blocks money-moving functions while paused (reclaim excepted)', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    await expect(f.contract.connect(f.outsider).pause())
      .to.be.revertedWithCustomError(f.contract, 'OwnableUnauthorizedAccount').withArgs(f.outsider.address)

    await f.contract.connect(f.reader).subscribe(f.writerA.address, 1000n, { value: ethers.parseEther('1') })
    await f.contract.connect(f.owner).pause()
    expect(await f.contract.paused()).to.equal(true)

    for (const action of [
      () => f.contract.connect(f.reader).subscribe(f.writerA.address, 1n, { value: 1n }),
      () => f.contract.connect(f.reader).topUp({ value: 1n }),
      () => f.contract.connect(f.reader).changeRate(1n),
      () => f.contract.connect(f.reader).unsubscribe(),
      () => f.contract.connect(f.writerA).withdraw(1n),
    ]) {
      await expect(action()).to.be.revertedWithCustomError(f.contract, 'EnforcedPause')
    }

    await f.contract.connect(f.reader).reclaim(1n) // reader can always recover their own funds — throws (failing the test) if this reverts

    await expect(f.contract.connect(f.outsider).unpause())
      .to.be.revertedWithCustomError(f.contract, 'OwnableUnauthorizedAccount').withArgs(f.outsider.address)
    await f.contract.connect(f.owner).unpause()
    expect(await f.contract.paused()).to.equal(false)
  })

  it('previewAccrual matches what an actual settle would produce, without mutating state', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const rateA = 1000n
    await f.contract.connect(f.reader).subscribe(f.writerA.address, rateA, { value: ethers.parseEther('1') })
    await networkHelpers.time.increase(42)
    const tIncrease = BigInt((await ethers.provider.getBlock('latest'))!.timestamp)

    const preview1 = await f.contract.previewAccrual(f.reader.address)
    const preview2 = await f.contract.previewAccrual(f.reader.address)
    expect(preview1.settleable).to.equal(preview2.settleable) // calling it twice doesn't mutate/double-count
    expect(preview1.remainingBalance).to.equal(preview2.remainingBalance)
    expect(preview1.settleable).to.equal(rateA * 42n)

    const { timestamp: t1 } = await sendAndSettle(f.contract.connect(f.reader).changeRate(rateA))
    const extraGap = t1 - tIncrease
    expect(await f.contract.earnings(f.writerA.address)).to.equal(preview1.settleable + rateA * extraGap)
  })
})
