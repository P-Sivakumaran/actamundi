# ActaMundi - Decentralized News Platform with Truth Verification

ActaMundi is a decentralized news platform that combines traditional journalism with blockchain technology to ensure content authenticity and combat misinformation. The platform features a sophisticated truth verification system that leverages smart contracts and community-driven verification.

## Features

### Truth Verification System
- **Smart Contract-Based Verification**
  - Claim submission and verification
  - Evidence-based verification process
  - Falsehood detection and scoring
  - Stake-based verification system
  - Reputation-based verifier system

- **Lie Detection & Falsehood Verification**
  - Evidence submission and verification
  - Falsehood scoring system (0-100)
  - Category-based verification thresholds
  - Source reliability tracking
  - Expertise-based verification

- **Anti-Abuse Measures**
  - Stake requirements for verification
  - Cooldown periods between actions
  - Reputation penalties for incorrect verifications
  - Source blacklisting system
  - Category-specific thresholds

### Content Management
- Rich text editor for article creation
- Article categorization and tagging
- Draft and publishing workflow
- Content versioning
- SEO optimization

### Blockchain Integration
- Multi-chain support (Ethereum, Polygon, Arbitrum, Optimism, Base)
- Real-time network status monitoring
- Wallet connection and management
- Transaction tracking and confirmation
- Event listening and updates

## Technical Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Hook Form
- Zod Validation
- TipTap Rich Text Editor

### Backend
- MongoDB for content storage
- Smart Contracts for truth verification
- Web3.js for blockchain interaction
- Next.js API Routes

### Smart Contracts
- Solidity
- OpenZeppelin Contracts
- Hardhat Development Environment
- Ethers.js

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/P-Sivakumaran/actamundi.git
cd actamundi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration:
```
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

4. Run the development server:
```bash
npm run dev
```

5. Deploy smart contracts:
```bash
npx hardhat run scripts/deploy.ts --network <network>
```

## Smart Contract Features

### TruthVerification Contract
- Claim submission and verification
- Evidence management
- Falsehood detection
- Stake management
- Source reliability tracking
- Category-based thresholds

### Security Features
- ReentrancyGuard for transaction safety
- Pausable functionality for emergency stops
- Ownable access control
- Stake-based verification
- Cooldown periods
- Reputation system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for smart contract security patterns
- Next.js team for the amazing framework
- Shadcn UI for the beautiful components
- TipTap for the rich text editor 