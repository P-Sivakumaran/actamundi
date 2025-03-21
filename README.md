# ActaMundi - Decentralized News Platform

ActaMundi is a modern decentralized news platform that combines traditional journalism with blockchain technology. It provides a secure, transparent, and monetizable platform for news content while maintaining professional editorial standards.

## Key Features

- **Decentralized Architecture**: Built on blockchain technology for transparency and immutability
- **Professional News Management**: 
  - Rich text editor for professional journalism
  - Article versioning and history
  - Editorial workflow management
  - Category and tag organization
- **Monetization Ready**:
  - Subscription system integration
  - Premium content management
  - Ad placement optimization
  - Revenue tracking dashboard
- **Content Security**:
  - Blockchain-based content verification
  - Immutable article history
  - Author attribution system
- **Modern Publishing Tools**:
  - Rich text editor with media support
  - SEO optimization
  - Social media integration
  - Analytics dashboard
- **Admin Dashboard**: Secure interface for content management
- **Responsive Design**: Mobile-first approach for all devices
- **Image Management**: Optimized image handling with Cloudinary
- **Authentication**: Secure access with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MongoDB (with blockchain integration)
- **Authentication**: NextAuth.js
- **Rich Text Editor**: TipTap
- **Image Storage**: Cloudinary
- **Blockchain Integration**: Ethereum/Solana (configurable)
- **Deployment**: Vercel (recommended)

## Business Value

ActaMundi is designed as a turnkey solution for:
- Independent news publishers
- Digital media entrepreneurs
- Content creators looking to monetize
- News organizations transitioning to Web3

### Revenue Streams
- Subscription management
- Premium content access
- Advertising integration
- Sponsored content
- Token-based rewards system

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
   Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   
   # Blockchain Configuration
   BLOCKCHAIN_NETWORK=ethereum
   BLOCKCHAIN_RPC_URL=your_rpc_url
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
actamundi/
├── app/
│   ├── (public)/        # Public routes
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── articles/       # Article pages
│   ├── auth/          # Authentication
│   └── setup/         # Initial setup
├── components/        # Reusable components
├── lib/              # Utility functions
├── models/           # Data models
├── scripts/          # Utility scripts
└── types/            # TypeScript types
```

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run seed`: Seed the database with sample articles

## Business Model

ActaMundi is designed as a complete business solution with:
- Multiple revenue streams
- Scalable architecture
- Professional content management
- Blockchain integration
- Monetization features

## License

This project is licensed under the MIT License - see the LICENSE file for details. 