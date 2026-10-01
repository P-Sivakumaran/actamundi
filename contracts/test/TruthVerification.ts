import { expect } from 'chai'
import { network } from 'hardhat'
import Governance from '../ignition/modules/TruthVerification.js'

const { ethers, ignition, networkHelpers } = await network.create()
const DELAY = 48 * 60 * 60
const ZERO = ethers.ZeroHash
const stake = ethers.parseEther('0.1')

async function deployed() {
  const [boardA, boardB, author, helperA, helperB, v1, v2, v3, outsider] = await ethers.getSigners()
  const { timelock, truthVerification: truth } = await ignition.deploy(Governance, {
    parameters: { TruthVerificationGovernance: { boardAddrs: [boardA.address, boardB.address] } },
  })
  let nonce = 0
  async function scheduled(method: string, args: unknown[] = []) {
    const data = truth.interface.encodeFunctionData(method, args)
    const salt = ethers.id(`operation-${nonce++}`)
    const target = await truth.getAddress()
    const id = await timelock.hashOperation(target, 0, data, ZERO, salt)
    await timelock.connect(boardA).getFunction('schedule')(target, 0, data, ZERO, salt, DELAY)
    const execute = () => timelock.connect(outsider).getFunction('execute')(target, 0, data, ZERO, salt)
    return { data, salt, target, id, execute }
  }
  async function govern(method: string, args: unknown[] = []) {
    const operation = await scheduled(method, args)
    await networkHelpers.time.increase(DELAY)
    await operation.execute()
  }
  return { timelock, truth, boardA, boardB, author, helperA, helperB, v1, v2, v3, outsider, scheduled, govern }
}

async function ready() {
  const f = await deployed()
  for (const member of [f.helperA, f.helperB, f.v1, f.v2, f.v3]) {
    await f.govern('registerVerifier', [member.address, ['factual']])
    await f.truth.connect(member).getFunction('depositStake')({ value: stake })
  }
  await f.govern('whitelistSource', ['source'])
  await f.govern('unpause')
  return f
}

async function claim(f: Awaited<ReturnType<typeof ready>>, content = 'A claim') {
  const receipt = await (await f.truth.connect(f.author).getFunction('submitClaim')(content, 'source')).wait()
  const event = receipt!.logs.map((log: any) => {
    try { return f.truth.interface.parseLog(log) } catch { return null }
  }).find((log: any) => log?.name === 'ClaimSubmitted')
  return event!.args.claimId
}

async function evidence(f: Awaited<ReturnType<typeof ready>>, id: string, supporting = true) {
  const receipt = await (await f.truth.connect(f.author).getFunction('submitEvidence')(id, 'Evidence', 'evidence-source', supporting)).wait()
  const event = receipt!.logs.map((log: any) => {
    try { return f.truth.interface.parseLog(log) } catch { return null }
  }).find((log: any) => log?.name === 'EvidenceSubmitted')
  return event!.args.evidenceId
}

// Earn reputation through the existing public API; no storage writes or fake
// governor impersonation. Third and later evidence votes currently earn +10.
async function experienced() {
  const f = await ready()
  const training = await claim(f, 'Training claim')
  for (let i = 0; i < 10; i++) {
    const id = await evidence(f, training)
    for (const verifier of [f.helperA, f.helperB, f.v1, f.v2, f.v3]) {
      await f.truth.connect(verifier).getFunction('verifyEvidence')(id)
    }
  }
  return f
}

describe('TruthVerification governance (Ignition deployment)', () => {
  it('wires an immutable timelock governor, both board roles, open execution, and no deployer admin', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    expect(await f.truth.governor()).to.equal(await f.timelock.getAddress())
    expect(await f.truth.paused()).to.equal(true)
    expect(await f.timelock.getMinDelay()).to.equal(BigInt(DELAY))
    for (const member of [f.boardA, f.boardB]) {
      expect(await f.timelock.hasRole(await f.timelock.PROPOSER_ROLE(), member.address)).to.equal(true)
      expect(await f.timelock.hasRole(await f.timelock.CANCELLER_ROLE(), member.address)).to.equal(true)
      expect(await f.timelock.hasRole(await f.timelock.DEFAULT_ADMIN_ROLE(), member.address)).to.equal(false)
    }
    expect(await f.timelock.hasRole(await f.timelock.EXECUTOR_ROLE(), ethers.ZeroAddress)).to.equal(true)
    expect(await f.timelock.hasRole(await f.timelock.DEFAULT_ADMIN_ROLE(), await f.timelock.getAddress())).to.equal(true)
  })

  it('rejects a zero governor', async () => {
    await expect(ethers.deployContract('TruthVerification', [ethers.ZeroAddress])).to.be.revertedWith('Governor required')
  })

  it('supports a configured delay and board without granting deployment authority', async () => {
    const isolated = await network.create()
    try {
      const [deployer, board] = await isolated.ethers.getSigners()
      const { timelock, truthVerification } = await isolated.ignition.deploy(Governance, {
        parameters: { TruthVerificationGovernance: { boardAddrs: [board.address], minDelay: 3600 } },
      })
      expect(await timelock.getMinDelay()).to.equal(3600n)
      expect(await timelock.hasRole(await timelock.PROPOSER_ROLE(), board.address)).to.equal(true)
      expect(await timelock.hasRole(await timelock.PROPOSER_ROLE(), deployer.address)).to.equal(false)
      expect(await truthVerification.governor()).to.equal(await timelock.getAddress())
    } finally {
      await isolated.close()
    }
  })

  for (const [method, args] of [
    ['registerVerifier', [ethers.ZeroAddress, []]], ['deactivateVerifier', [ethers.ZeroAddress]],
    ['whitelistSource', ['x']], ['blacklistSource', ['x']],
    ['updateSourceReliability', ['x', 50]], ['updateCategoryThreshold', ['x', 50]],
    ['pause', []], ['unpause', []],
  ] as const) {
    it(`rejects direct ${method} calls from outsiders and board members`, async () => {
      const f = await networkHelpers.loadFixture(deployed)
      for (const sender of [f.outsider, f.boardA]) {
        await expect(f.truth.connect(sender).getFunction(method)(...args)).to.be.revertedWith('Not the governor')
      }
    })
  }

  it('enforces the appeal window, then lets an outsider execute exactly once', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const op = await f.scheduled('whitelistSource', ['new-source'])
    await expect(op.execute()).to.be.revertedWithCustomError(f.timelock, 'TimelockUnexpectedOperationState')
    expect((await f.truth.getSource('new-source')).isWhitelisted).to.equal(false)
    await networkHelpers.time.increase(DELAY)
    await expect(op.execute()).to.emit(f.truth, 'SourceWhitelisted').withArgs('new-source')
    expect((await f.truth.getSource('new-source')).isWhitelisted).to.equal(true)
    expect(await f.timelock.isOperationDone(op.id)).to.equal(true)
    await expect(op.execute()).to.be.revertedWithCustomError(f.timelock, 'TimelockUnexpectedOperationState')
  })

  it('allows a different board member to veto; a cancelled operation cannot execute', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const op = await f.scheduled('whitelistSource', ['vetoed'])
    await expect(f.timelock.connect(f.outsider).getFunction('cancel')(op.id)).to.be.revertedWithCustomError(f.timelock, 'AccessControlUnauthorizedAccount')
    await expect(f.timelock.connect(f.boardB).getFunction('cancel')(op.id)).to.emit(f.timelock, 'Cancelled').withArgs(op.id)
    await networkHelpers.time.increase(DELAY)
    await expect(op.execute()).to.be.revertedWithCustomError(f.timelock, 'TimelockUnexpectedOperationState')
    expect((await f.truth.getSource('vetoed')).isWhitelisted).to.equal(false)
  })

  it('rejects unauthorized proposals, short delays, and immediate role grants', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    const target = await f.truth.getAddress()
    const data = f.truth.interface.encodeFunctionData('unpause')
    await expect(f.timelock.connect(f.outsider).getFunction('schedule')(target, 0, data, ZERO, ZERO, DELAY))
      .to.be.revertedWithCustomError(f.timelock, 'AccessControlUnauthorizedAccount')
    await expect(f.timelock.connect(f.boardA).getFunction('schedule')(target, 0, data, ZERO, ZERO, DELAY - 1))
      .to.be.revertedWithCustomError(f.timelock, 'TimelockInsufficientDelay')
    await expect(f.timelock.connect(f.boardA).getFunction('grantRole')(await f.timelock.PROPOSER_ROLE(), f.outsider.address))
      .to.be.revertedWithCustomError(f.timelock, 'AccessControlUnauthorizedAccount')
  })

  it('executes all remaining administrative actions through the timelock', async () => {
    const f = await networkHelpers.loadFixture(deployed)
    await f.govern('registerVerifier', [f.v1.address, ['science']])
    expect((await f.truth.getVerifier(f.v1.address)).isActive).to.equal(true)
    await f.govern('deactivateVerifier', [f.v1.address])
    expect((await f.truth.getVerifier(f.v1.address)).isActive).to.equal(false)
    await f.govern('whitelistSource', ['x'])
    await f.govern('updateSourceReliability', ['x', 75])
    expect((await f.truth.getSource('x')).reliability).to.equal(75n)
    await f.govern('blacklistSource', ['x'])
    expect((await f.truth.getSource('x')).isWhitelisted).to.equal(false)
    expect((await f.truth.getSource('x')).reliability).to.equal(0n)
    await f.govern('updateCategoryThreshold', ['science', 90])
    expect(await f.truth.categoryThresholds('science')).to.equal(90n)
    await f.govern('unpause')
    expect(await f.truth.paused()).to.equal(false)
    await f.govern('pause')
    expect(await f.truth.paused()).to.equal(true)
  })
})

describe('TruthVerification regression', () => {
  it('submits unique claims, records author/source, and rejects invalid or untrusted content', async () => {
    const f = await networkHelpers.loadFixture(ready)
    const id = await claim(f)
    expect(await claim(f)).not.to.equal(id)
    const result = await f.truth.getClaim(id)
    expect(result.content).to.equal('A claim')
    expect(result.author).to.equal(f.author.address)
    expect(result.verificationThreshold).to.equal(3n)
    expect((await f.truth.getSource('source')).totalClaims).to.equal(2n)
    await expect(f.truth.submitClaim('', 'source')).to.be.revertedWith('Content cannot be empty')
    await expect(f.truth.submitClaim('x', '')).to.be.revertedWith('Source cannot be empty')
    await expect(f.truth.submitClaim('x', 'unknown')).to.be.revertedWith('Source not trusted')
  })

  it('records both evidence directions, unique IDs, and evidence verification', async () => {
    const f = await networkHelpers.loadFixture(ready)
    const id = await claim(f)
    const ev = await evidence(f, id)
    expect(await evidence(f, id, false)).not.to.equal(ev)
    const result = await f.truth.getClaim(id)
    expect(result.supportingEvidence).to.deep.equal(['Evidence'])
    expect(result.contradictingEvidence).to.deep.equal(['Evidence'])
    for (const v of [f.helperA, f.helperB, f.v1]) await f.truth.connect(v).getFunction('verifyEvidence')(ev)
    expect((await f.truth.getEvidence(ev)).isVerified).to.equal(true)
    expect((await f.truth.getEvidence(ev)).submitter).to.equal(f.author.address)
    await expect(f.truth.connect(f.v1).getFunction('verifyEvidence')(ev)).to.be.revertedWith('Already verified')
    await expect(f.truth.submitEvidence(ZERO, 'x', 'y', true)).to.be.revertedWith('Claim does not exist')
    await expect(f.truth.submitEvidence(id, '', 'y', true)).to.be.revertedWith('Content cannot be empty')
  })

  it('verifies at three votes, updates reputation/source, and enforces duplicates/cooldown', async () => {
    const f = await networkHelpers.loadFixture(ready)
    const id = await claim(f)
    for (const v of [f.v1, f.v2]) await f.truth.connect(v).getFunction('verifyClaim')(id)
    expect((await f.truth.getClaim(id)).isVerified).to.equal(false)
    await expect(f.truth.connect(f.v3).getFunction('verifyClaim')(id)).to.emit(f.truth, 'ClaimVerified').withArgs(id, f.v3.address)
    expect((await f.truth.getClaim(id)).isVerified).to.equal(true)
    expect((await f.truth.getVerifier(f.v3.address)).reputation).to.equal(110n)
    expect((await f.truth.getSource('source')).verifiedClaims).to.equal(1n)
    const another = await claim(f)
    await expect(f.truth.connect(f.v3).getFunction('verifyClaim')(another)).to.be.revertedWith('Verification cooldown active')
    await networkHelpers.time.increase(3600)
    await expect(f.truth.connect(f.v3).getFunction('verifyClaim')(id)).to.be.revertedWith('Already verified')
    await f.truth.connect(f.v3).getFunction('verifyClaim')(another)
  })

  it('rejects inactive verifiers, missing stake, and nonexistent claims', async () => {
    const f = await networkHelpers.loadFixture(ready)
    const id = await claim(f)
    await expect(f.truth.connect(f.outsider).getFunction('verifyClaim')(id)).to.be.revertedWith('Not an active verifier')
    await f.govern('registerVerifier', [f.outsider.address, []])
    await expect(f.truth.connect(f.outsider).getFunction('verifyClaim')(id)).to.be.revertedWith('Insufficient stake')
    await expect(f.truth.connect(f.v1).getFunction('verifyClaim')(ZERO)).to.be.revertedWith('Claim does not exist')
  })

  it('disputes at three votes, preserves existing penalties/rewards, and blocks verification', async () => {
    const f = await networkHelpers.loadFixture(experienced)
    const id = await claim(f)
    await f.truth.connect(f.v1).getFunction('disputeClaim')(id)
    expect((await f.truth.getVerifier(f.v1.address)).reputation).to.equal(180n)
    await f.truth.connect(f.v2).getFunction('disputeClaim')(id)
    expect((await f.truth.getClaim(id)).isDisputed).to.equal(false)
    await expect(f.truth.connect(f.v3).getFunction('disputeClaim')(id)).to.emit(f.truth, 'ClaimDisputed')
    expect((await f.truth.getClaim(id)).isDisputed).to.equal(true)
    expect((await f.truth.getVerifier(f.v3.address)).reputation).to.equal(210n)
    expect((await f.truth.getSource('source')).disputedClaims).to.equal(1n)
    await expect(f.truth.connect(f.helperA).getFunction('verifyClaim')(id)).to.be.revertedWith('Claim is disputed')
    const next = await claim(f)
    await expect(f.truth.connect(f.v1).getFunction('disputeClaim')(next)).to.be.revertedWith('Dispute cooldown active')
    await networkHelpers.time.increase(7200)
    await expect(f.truth.connect(f.v1).getFunction('disputeClaim')(id)).to.be.revertedWith('Already disputed')
    await f.truth.connect(f.v1).getFunction('disputeClaim')(next)
  })

  it('enforces dispute reputation and rejects disputes of verified claims', async () => {
    const f = await networkHelpers.loadFixture(experienced)
    const id = await claim(f)
    await expect(f.truth.connect(f.helperA).getFunction('disputeClaim')(id)).to.be.revertedWith('Insufficient reputation')
    for (const v of [f.v1, f.v2, f.v3]) await f.truth.connect(v).getFunction('verifyClaim')(id)
    await expect(f.truth.connect(f.v1).getFunction('disputeClaim')(id)).to.be.revertedWith('Claim is already verified')
  })

  it('detects falsehood, updates source/reputation, and enforces score/cooldown/final state', async () => {
    const f = await networkHelpers.loadFixture(experienced)
    const id = await claim(f)
    await expect(f.truth.connect(f.v1).getFunction('detectFalsehood')(id, 101, 'reason')).to.be.revertedWith('Invalid falsehood score')
    await expect(f.truth.connect(f.helperA).getFunction('detectFalsehood')(id, 10, 'reason')).to.be.revertedWith('Insufficient reputation')
    await expect(f.truth.connect(f.v1).getFunction('detectFalsehood')(id, 10, 'reason')).to.emit(f.truth, 'FalsehoodDetected').withArgs(id, f.v1.address, 10)
    expect((await f.truth.getClaim(id)).falsehoodScore).to.equal(5n)
    expect((await f.truth.getClaim(id)).isFalsehood).to.equal(true)
    expect((await f.truth.getVerifier(f.v1.address)).successfulFalsehoodDetections).to.equal(1n)
    expect((await f.truth.getSource('source')).falsehoodRate).to.equal(50n)
    await expect(f.truth.connect(f.v2).getFunction('verifyClaim')(id)).to.be.revertedWith('Claim is marked as falsehood')
    await expect(f.truth.connect(f.v2).getFunction('disputeClaim')(id)).to.be.revertedWith('Claim is marked as falsehood')
    const next = await claim(f)
    await expect(f.truth.connect(f.v1).getFunction('detectFalsehood')(next, 10, '')).to.be.revertedWith('Falsehood detection cooldown active')
    await networkHelpers.time.increase(14400)
    await expect(f.truth.connect(f.v1).getFunction('detectFalsehood')(id, 10, '')).to.be.revertedWith('Already marked as falsehood')
    await f.truth.connect(f.v1).getFunction('detectFalsehood')(next, 10, '')
  })

  it('preserves the existing penalty for a sub-threshold falsehood score', async () => {
    const f = await networkHelpers.loadFixture(experienced)
    const id = await claim(f)
    await f.truth.connect(f.v1).getFunction('detectFalsehood')(id, 2, '')
    expect((await f.truth.getClaim(id)).isFalsehood).to.equal(false)
    expect((await f.truth.getVerifier(f.v1.address)).reputation).to.equal(180n)
    expect((await f.truth.getVerifier(f.v1.address)).failedFalsehoodDetections).to.equal(1n)
  })

  it('enforces stake bounds/lock and transfers withdrawn stake after 30 days', async () => {
    const f = await networkHelpers.loadFixture(ready)
    await expect(f.truth.connect(f.v1).getFunction('depositStake')({ value: stake - 1n })).to.be.revertedWith('Insufficient stake amount')
    await expect(f.truth.connect(f.v1).getFunction('depositStake')({ value: ethers.parseEther('10') + 1n })).to.be.revertedWith('Exceeds maximum stake')
    const id = await claim(f)
    await f.truth.connect(f.v1).getFunction('verifyClaim')(id)
    await expect(f.truth.connect(f.v1).getFunction('withdrawStake')(stake)).to.be.revertedWith('Stake locked')
    await expect(f.truth.connect(f.v1).getFunction('withdrawStake')(stake + 1n)).to.be.revertedWith('Insufficient stake')
    await networkHelpers.time.increase(30 * 86400)
    await expect(f.truth.connect(f.v1).getFunction('withdrawStake')(stake)).to.changeEtherBalances(ethers, [f.truth, f.v1], [-stake, stake])
    expect(await f.truth.stakeAmount(f.v1.address)).to.equal(0n)
    expect((await f.truth.getVerifier(f.v1.address)).lockedStake).to.equal(0n)
    // totalStake is cumulative in the existing implementation, not current balance.
    expect((await f.truth.getVerifier(f.v1.address)).totalStake).to.equal(stake)
  })

  it('pauses claim/evidence/vote actions but keeps deposits available', async () => {
    const f = await networkHelpers.loadFixture(experienced)
    const id = await claim(f)
    await f.govern('pause')
    for (const action of [
      () => f.truth.submitClaim('x', 'source'),
      () => f.truth.submitEvidence(id, 'x', 'y', true),
      () => f.truth.connect(f.v1).getFunction('verifyClaim')(id),
      () => f.truth.connect(f.v1).getFunction('disputeClaim')(id),
      () => f.truth.connect(f.v1).getFunction('detectFalsehood')(id, 10, ''),
    ]) await expect(action()).to.be.revertedWithCustomError(f.truth, 'EnforcedPause')
    await expect(f.truth.connect(f.v1).getFunction('depositStake')({ value: stake })).to.emit(f.truth, 'StakeDeposited')
  })
})
