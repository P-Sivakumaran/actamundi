import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('WriterSubscriptions', (m) => {
  const writerSubscriptions = m.contract('WriterSubscriptions', [])
  return { writerSubscriptions }
})
