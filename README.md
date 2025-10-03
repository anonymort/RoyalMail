# Royal Mail Delivery Times

A crowd-sourced web application for tracking Royal Mail delivery times across UK postcodes. Users can search for delivery patterns in their postcode sector and contribute their own delivery data to help build a comprehensive picture of postal service performance.

## Features

- **Postcode Search**: Search by postcode sector to view historical delivery times in your area
- **Delivery Reporting**: Report your own deliveries to contribute to the community dataset
- **Data Visualization**: Interactive charts showing delivery patterns including:
  - Delivery time histograms
  - Daily sparkline trends
  - Delivery type breakdowns (tracked vs standard)
- **Dark Mode**: Built-in theme toggle for comfortable viewing
- **Privacy-First**: Optional analytics with user consent

## Tech Stack

- **Framework**: Next.js 15.5 with React 19 RC
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Catppuccin color theme
- **Charts**: Recharts for data visualization
- **Database**: SQLite (better-sqlite3) / PostgreSQL support
- **Testing**: Vitest (unit tests) and Playwright (E2E tests)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/royal-mail-delivery-times.git
cd royal-mail-delivery-times
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - The application uses SQLite by default
   - Configure database connection in your environment variables if using PostgreSQL

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production (runs linting and type checking first)
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test:unit` - Run unit tests with Vitest
- `npm test:e2e` - Run E2E tests with Playwright

## Project Structure

```
/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── theme/       # Theme-related components
├── lib/             # Utility functions and database logic
├── public/          # Static assets
├── tests/           # Test files
│   ├── unit/       # Unit tests
│   └── e2e/        # E2E tests
└── styles/          # Global styles
```

## Key Features

### Data Quality
- Automated validation for:
  - Postcode format verification
  - Delivery time consistency checks
  - Date validation (no future dates, realistic ranges)
  - Duplicate detection

### Performance
- Server-side rendering for optimal initial load
- Efficient database queries with proper indexing
- Responsive design for all device sizes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Deployment

The application can be deployed to various platforms:
- Vercel (recommended for Next.js)
- Railway (with included MCP server configuration)
- Any Node.js hosting platform

For Railway deployment, the project includes Railway MCP server configuration for enhanced deployment capabilities.