export interface Service {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  description: string;
  enabled: boolean;
}

export interface LocalStackHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  endpoint: string;
  version?: string;
  lastChecked: Date;
  services: Service[];
}

export interface S3Bucket {
  name: string;
  creationDate: Date;
  region?: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  eTag?: string;
  storageClass?: string;
}

export interface DynamoDBTable {
  tableName: string;
  tableStatus: 'CREATING' | 'ACTIVE' | 'DELETING' | 'UPDATING';
  creationDateTime: Date;
  itemCount: number;
  tableSizeBytes: number;
  tableArn?: string;
  keySchema?: Array<{
    attributeName: string;
    keyType: 'HASH' | 'RANGE';
  }>;
}

export interface SQSQueue {
  queueUrl: string;
  queueName: string;
  attributes?: {
    ApproximateNumberOfMessages?: string;
    ApproximateNumberOfMessagesNotVisible?: string;
    ApproximateNumberOfMessagesDelayed?: string;
    CreatedTimestamp?: string;
    LastModifiedTimestamp?: string;
    VisibilityTimeout?: string;
    MaximumMessageSize?: string;
    MessageRetentionPeriod?: string;
    DelaySeconds?: string;
    ReceiveMessageWaitTimeSeconds?: string;
  };
}

export interface SQSMessage {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes?: Record<string, string>;
  messageAttributes?: Record<string, any>;
}

export interface Secret {
  arn?: string;
  name: string;
  description?: string;
  createdDate?: Date;
  lastChangedDate?: Date;
  lastAccessedDate?: Date;
  tags?: Record<string, string>;
  versionId?: string;
  versionStages?: string[];
}

export interface SecretVersion {
  versionId: string;
  versionStages?: string[];
  createdDate?: Date;
  lastAccessedDate?: Date;
}

export interface SecretValue {
  arn?: string;
  name: string;
  versionId?: string;
  secretString?: string;
  secretBinary?: string;
  versionStages?: string[];
  createdDate?: Date;
}

export interface LambdaFunction {
  functionName: string;
  functionArn?: string;
  runtime?: string;
  role?: string;
  handler?: string;
  codeSize?: number;
  description?: string;
  timeout?: number;
  memorySize?: number;
  lastModified?: string;
  codeSha256?: string;
  version?: string;
  environment?: {
    variables?: Record<string, string>;
  };
  state?: 'Pending' | 'Active' | 'Inactive' | 'Failed';
  stateReason?: string;
  stateReasonCode?: string;
  vpcConfig?: {
    subnetIds?: string[];
    securityGroupIds?: string[];
    vpcId?: string;
  };
  layers?: Array<{
    arn?: string;
    codeSize?: number;
  }>;
  tags?: Record<string, string>;
}

export interface LambdaConfiguration {
  functionName: string;
  functionArn: string;
  runtime: string;
  role: string;
  handler: string;
  codeSize: number;
  description?: string;
  timeout: number;
  memorySize: number;
  lastModified: string;
  codeSha256: string;
  version: string;
  environment?: {
    variables?: Record<string, string>;
  };
  state?: string;
  stateReason?: string;
  vpcConfig?: any;
  layers?: any[];
  tags?: Record<string, string>;
}