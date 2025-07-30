# LocalStack UI

A modern web-based interface for managing and monitoring LocalStack AWS services during local development.

## Features

- 🚀 **Real-time Service Monitoring** - View the status of your LocalStack services
- 📦 **S3 Management** - Create, browse, and manage S3 buckets and objects
- 🔐 **Secrets Manager** - Manage secrets with full CRUD operations
- ⚡ **Lambda Functions** - View and monitor Lambda functions
- 🎨 **Modern UI** - Built with Next.js 14 and shadcn/ui components
- 🔄 **Auto-refresh** - Real-time updates using TanStack Query
- 🌐 **No CORS Issues** - Server-side API routes handle all AWS SDK calls

## Prerequisites

- Node.js 18+ and npm
- LocalStack running locally (default: http://localhost:4566)
- Docker (for running LocalStack)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd localstack-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Adjust the values in `.env.local` if your LocalStack instance runs on a different endpoint.

4. **Start LocalStack** (if not already running)
   ```bash
   docker run -d -p 4566:4566 -p 4571:4571 localstack/localstack
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
npm run format       # Format code with Prettier
```

## Supported Services

| Service | Status | Features |
|---------|--------|----------|
| S3 | ✅ Complete | Create/delete buckets, upload/download objects, manage permissions |
| Secrets Manager | ✅ Complete | Create/update/delete secrets, view secret values |
| Lambda | ✅ Read-only | List functions, view configurations |
| DynamoDB | ⏳ Planned | - |
| SQS | ⏳ Planned | - |
| SNS | ⏳ Planned | - |
| CloudFormation | ⏳ Planned | - |
| CloudWatch | ⏳ Planned | - |

## Architecture

```
localstack-ui/
├── app/                    # Next.js App Router
│   ├── api/               # Server-side API routes
│   └── services/          # Service pages
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── services/         # Service-specific components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── types/                # TypeScript definitions
└── config/              # App configuration
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_LOCALSTACK_ENDPOINT` | LocalStack endpoint URL | `http://localhost:4566` |
| `NEXT_PUBLIC_AWS_REGION` | AWS region for LocalStack | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key (use 'test' for LocalStack) | `test` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (use 'test' for LocalStack) | `test` |

### LocalStack Configuration

Ensure your LocalStack instance has the required services enabled. For a basic setup:

```bash
docker run -d \
  -p 4566:4566 \
  -e SERVICES=s3,lambda,secretsmanager,dynamodb,sqs,sns,cloudformation,cloudwatch \
  localstack/localstack
```

## Development

### Adding a New Service

See [CLAUDE.md](./CLAUDE.md) for detailed instructions on adding support for new LocalStack services.

### Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **AWS SDK**: [AWS SDK v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)

### Best Practices

1. **Use API Routes**: All AWS SDK calls should go through Next.js API routes to avoid CORS issues
2. **Type Safety**: Define TypeScript types for all data structures
3. **Error Handling**: Implement proper error handling with user-friendly messages
4. **Loading States**: Show loading indicators for all async operations
5. **Accessibility**: Ensure all interactive elements are keyboard accessible

## Troubleshooting

### LocalStack Connection Issues

If you can't connect to LocalStack:

1. Verify LocalStack is running:
   ```bash
   curl http://localhost:4566/_localstack/health
   ```

2. Check Docker containers:
   ```bash
   docker ps
   ```

3. View LocalStack logs:
   ```bash
   docker logs <localstack-container-id>
   ```

### CORS Errors

If you encounter CORS errors, ensure you're:
- Using the Next.js API routes (`/api/*`) instead of direct client-side AWS SDK calls
- LocalStack endpoint is correctly configured in your environment variables

### Build Errors

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check TypeScript errors:
   ```bash
   npm run typecheck
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pre-commit Checklist

- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm run typecheck` and fix any type errors
- [ ] Run `npm run build` to ensure the project builds
- [ ] Test your changes with LocalStack running
- [ ] Update documentation if needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [LocalStack](https://localstack.cloud/) for providing local AWS services
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing React framework