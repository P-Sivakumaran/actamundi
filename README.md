# Acta Mundi

A sophisticated magazine website inspired by The New Yorker, The Monthly, and Saturday Paper style. Built with Next.js and Tailwind CSS.

## Features

- Modern, responsive design
- Beautiful typography with Playfair Display and Inter fonts
- Featured article section with full-width hero image
- Latest articles grid
- Newsletter subscription
- Clean, elegant layout suitable for long-form journalism

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/acta-mundi.git
cd acta-mundi
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
acta-mundi/
├── app/
│   ├── layout.tsx      # Root layout with navigation and footer
│   ├── page.tsx        # Home page with featured and latest articles
│   └── globals.css     # Global styles and Tailwind imports
├── components/         # Reusable components
├── public/            # Static assets
└── styles/            # Additional styles
```

## Development

- The site is built with Next.js 14 and uses the App Router
- Styling is done with Tailwind CSS
- Images are optimized using Next.js Image component
- The design is mobile-first and responsive

## Deployment

The site can be deployed to any platform that supports Next.js, such as:
- Vercel (recommended)
- Netlify
- AWS Amplify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 