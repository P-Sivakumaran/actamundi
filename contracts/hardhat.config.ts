import toolbox from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import { configVariable, defineConfig } from 'hardhat/config'

export default defineConfig({
  plugins: [toolbox],
  paths: { sources: '.' },
  solidity: {
    version: '0.8.34',
    // Optional offline compiler; otherwise Hardhat downloads the pinned version.
    path: process.env.ACTAMUNDI_SOLC_PATH,
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
    npmFilesToBuild: ['@openzeppelin/contracts/governance/TimelockController.sol'],
  },
  networks: {
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
  },
})
