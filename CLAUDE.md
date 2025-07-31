# LocalStack UI Development Guide

This document provides instructions for Claude (AI assistant) on how to work with and extend the LocalStack UI project.

## Project Overview

LocalStack UI is a standalone web-based interface for managing and monitoring LocalStack AWS services during local development. It provides a user-friendly dashboard to interact with various AWS services running locally.

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query v5
- **AWS SDK**: AWS SDK v3
- **LocalStack**: Running at http://localhost:4566

## Project Structure

```
localstack-ui/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes (server-side)
│   │   ├── s3/             # S3 service endpoints
│   │   ├── secretsmanager/ # Secrets Manager endpoints
│   │   └── lambda/         # Lambda service endpoints
│   ├── services/           # Service-specific pages
│   │   ├── s3/
│   │   ├── secretsmanager/
│   │   └── lambda/
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── layout/            # Layout components
│   ├── services/          # Service-specific components
│   │   ├── s3/
│   │   ├── secretsmanager/
│   │   └── lambda/
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
├── types/                 # TypeScript type definitions
└── config/               # Configuration files
```

## Development Guidelines

### 1. Code Style and Conventions

- Use TypeScript with strict mode enabled
- Follow existing code patterns and conventions
- Use server-side API routes to avoid CORS issues with LocalStack
- Implement proper error handling and loading states
- Make table rows clickable for better UX
- Use dialogs instead of sheets for viewing details

### 2. Testing Commands

Before committing any changes, run:

```bash
npm run lint        # Check for linting errors
npm run typecheck   # Check TypeScript types
npm run build       # Build the project
```

### 3. Component Architecture

- Use React Query for all data fetching
- Implement hooks for service interactions
- Keep components focused and reusable
- Use shadcn/ui components consistently

## Adding New LocalStack Services

To add support for a new LocalStack service, follow these steps:

### Step 1: Update Types

Add service-specific types in `/types/index.ts`:

```typescript
export interface YourServiceItem {
  id: string;
  name: string;
  // Add service-specific properties
}
```

### Step 2: Create AWS Client

Update `/lib/aws-config.ts` to add the new service client:

```typescript
import { YourServiceClient } from "@aws-sdk/client-your-service";

export const yourServiceClient = new YourServiceClient({
  endpoint: LOCALSTACK_ENDPOINT,
  region: AWS_REGION,
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});
```

### Step 3: Create API Routes

Create server-side API routes in `/app/api/your-service/`:

```typescript
// route.ts - List/Create operations
export async function GET() {
  // List items logic
}

export async function POST() {
  // Create item logic
}

// [id]/route.ts - Get/Update/Delete operations
export async function GET(request, { params }) {
  // Get single item logic
}

export async function PUT(request, { params }) {
  // Update item logic
}

export async function DELETE(request, { params }) {
  // Delete item logic
}
```

### Step 4: Create Hooks

Add React hooks in `/hooks/use-your-service.ts`:

```typescript
export function useYourServiceItems() {
  return useQuery({
    queryKey: ["your-service-items"],
    queryFn: async () => {
      const response = await fetch("/api/your-service");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });
}
```

### Step 5: Create Components

Create UI components in `/components/services/your-service/`:

1. **List Component** (`item-list.tsx`):
   - Display items in a table
   - Include search functionality
   - Make rows clickable to view details

2. **Viewer Component** (`item-viewer.tsx`):
   - Use Dialog component (not Sheet)
   - Auto-load item details when opened
   - Display all relevant information

3. **Create/Update Forms** (`item-form.tsx`):
   - Use form validation
   - Pre-populate values for updates
   - Handle errors gracefully

### Step 6: Create Service Page

Create the main page in `/app/services/your-service/page.tsx`:

```typescript
export default function YourServicePage() {
  return (
    <MainLayout>
      {/* Service overview cards */}
      {/* Alert for any service-specific notes */}
      {/* Main content card with list/create functionality */}
    </MainLayout>
  );
}
```

### Step 7: Update Navigation

Add the service to `/config/services.ts`:

```typescript
{
  id: 'your-service',
  name: 'Your Service',
  description: 'Service description',
  href: '/services/your-service',
  icon: YourIcon,
  enabled: true,
}
```

### Step 8: Update Health Check

Add health check in `/hooks/use-localstack.ts`:

```typescript
case 'your-service':
  await yourServiceClient.send(new ListYourItemsCommand({}));
  return { ...service, status: 'running' };
```

## Common Patterns

### Error Handling

Always wrap API calls in try-catch blocks and return appropriate error responses:

```typescript
try {
  // Your logic here
} catch (error: any) {
  console.error("Error:", error);
  return NextResponse.json(
    { error: error.message || "Operation failed" },
    { status: 500 },
  );
}
```

### Loading States

Use React Query's built-in loading states:

```typescript
const { data, isLoading, error } = useYourServiceItems();

if (isLoading) return <Skeleton />;
if (error) return <Alert>Error: {error.message}</Alert>;
```

### Search Implementation

Add search to list components:

```typescript
const [searchQuery, setSearchQuery] = useState("");

const filteredItems = items?.filter((item) =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
);
```

## Best Practices

1. **CORS Handling**: Always use Next.js API routes for AWS SDK calls
2. **State Management**: Use React Query for server state
3. **UI Consistency**: Follow existing UI patterns and use shadcn/ui
4. **Type Safety**: Define proper TypeScript types for all data
5. **Error Messages**: Provide clear, actionable error messages
6. **Loading Feedback**: Show loading states for all async operations
7. **Accessibility**: Ensure all interactive elements are keyboard accessible

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure you're using API routes, not direct client-side AWS SDK calls
2. **Type Errors**: Run `npm run typecheck` to identify issues
3. **Build Failures**: Check for missing imports or incorrect file paths
4. **LocalStack Connection**: Verify LocalStack is running at http://localhost:4566

### Debug Commands

```bash
# Check if LocalStack is running
curl http://localhost:4566/_localstack/health

# View application logs
npm run dev

# Check TypeScript errors
npm run typecheck

# Lint issues
npm run lint
```

## Service Implementation Status

- ✅ S3 (Full CRUD)
- ✅ Secrets Manager (Full CRUD)
- ✅ Lambda (Read-only)
- ⏳ DynamoDB (Not implemented)
- ⏳ SQS (Not implemented)
- ⏳ SNS (Not implemented)
- ⏳ CloudFormation (Not implemented)
- ⏳ CloudWatch (Not implemented)

## Notes for Future Development

1. When implementing new services, check if they require special handling (e.g., file uploads for S3)
2. Consider pagination for services that may have many items
3. Add filtering and sorting capabilities as services grow
4. Implement real-time updates using polling or WebSockets if needed
5. Consider adding export/import functionality for service configurations
