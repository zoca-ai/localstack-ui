import { Service } from "@/types";

export const AVAILABLE_SERVICES: Service[] = [
  {
    id: "s3",
    name: "s3",
    displayName: "S3",
    icon: "Database",
    status: "unknown",
    description: "Simple Storage Service - Object storage",
    enabled: true,
  },
  {
    id: "sqs",
    name: "sqs",
    displayName: "SQS",
    icon: "MessageSquare",
    status: "unknown",
    description: "Simple Queue Service - Message queuing",
    enabled: true,
  },
  {
    id: "secretsmanager",
    name: "secretsmanager",
    displayName: "Secrets Manager",
    icon: "Key",
    status: "unknown",
    description: "Secrets management service",
    enabled: true,
  },
  {
    id: "cloudwatch",
    name: "cloudwatch",
    displayName: "CloudWatch",
    icon: "Activity",
    status: "unknown",
    description: "Monitoring and observability",
    enabled: false,
  },
  {
    id: "iam",
    name: "iam",
    displayName: "IAM",
    icon: "Shield",
    status: "unknown",
    description: "Identity and Access Management",
    enabled: false,
  },
];

