import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('TruthVerificationGovernance', (m) => {
  const board = m.getParameter<string[]>('boardAddrs')
  const minDelay = m.getParameter('minDelay', 48 * 60 * 60)
  const zero = '0x0000000000000000000000000000000000000000'
  // OZ grants each initial proposer CANCELLER_ROLE too. Zero admin means
  // only the timelock itself can administer roles, through scheduled calls.
  const timelock = m.contract('TimelockController', [minDelay, board, [zero], zero])
  const truthVerification = m.contract('TruthVerification', [timelock])
  return { timelock, truthVerification }
})
