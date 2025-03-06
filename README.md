# TrenchesAI

A sophisticated AI-powered trading assistant built with Next.js and the Vercel AI SDK, featuring advanced blockchain integration, token creation, and automated trading tools.

## Features

- 🤖 AI-Powered Trading Assistant
- 💱 Blockchain Integration (Solana)
- 🪙 Token Creation & Management
- 💧 Automated AMM Pool Creation
- 📊 Market Analysis Tools
- 💬 Telegram Community Integration
- 🔒 Secure Authentication
- 🌓 Dark/Light Theme Support
- 🔄 Real-time Market Updates

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js 5
- **Blockchain**:
  - Solana Web3.js
  - Raydium SDK
  - Metaplex Foundation Tools
- **AI Integration**: Vercel AI SDK
- **Database**: Vercel Postgres with Drizzle ORM
- **UI/UX**:
  - Tailwind CSS
  - Radix UI
  - Framer Motion
- **State Management**: SWR
- **Form Handling**: React Hook Form

## Key Features

### Token Creation & Deployment

```typescript
export const CreateTokenForm = ({
  initialValues,
  chatId,
  message,
  toolCallId,
}: CreateTokenFormProps) => {
  const { mutateAsync: createToken } = useCreateTokenSc();
  const { mutateAsync: createMarket } = useCreateMarket();
  const { mutateAsync: createAmmPool } = useCreateAmmPool();
  // ... automated token deployment logic
};
```

### AI-Powered Trading Assistant

```typescript
export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
}: ChatProps) {
  // ... intelligent trading assistant implementation
}
```

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_PROJECT_ID` - Your project ID
- `DATABASE_URL` - Postgres database URL
- `NEXTAUTH_SECRET` - Authentication secret
- `SOLANA_RPC_URL` - Solana RPC endpoint

4. Initialize the database:

```bash
npm run db:migrate
```

5. Start the development server:

```bash
npm run dev
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run linting
npm run format      # Format code
```

### Database Management

```bash
npm run db:generate  # Generate database types
npm run db:migrate  # Run migrations
npm run db:studio   # Open Drizzle Studio
npm run db:push     # Push schema changes
```

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
