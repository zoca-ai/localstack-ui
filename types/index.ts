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

// IAM Types
export interface IAMUser {
  userName: string;
  userId: string;
  arn: string;
  path: string;
  createDate: Date;
  passwordLastUsed?: Date;
  permissionsBoundary?: {
    permissionsBoundaryType?: string;
    permissionsBoundaryArn?: string;
  };
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

export interface IAMRole {
  roleName: string;
  roleId: string;
  arn: string;
  path: string;
  createDate: Date;
  assumeRolePolicyDocument: string;
  description?: string;
  maxSessionDuration?: number;
  permissionsBoundary?: {
    permissionsBoundaryType?: string;
    permissionsBoundaryArn?: string;
  };
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

export interface IAMPolicy {
  policyName: string;
  policyId: string;
  arn: string;
  path: string;
  defaultVersionId: string;
  attachmentCount?: number;
  permissionsBoundaryUsageCount?: number;
  isAttachable: boolean;
  description?: string;
  createDate: Date;
  updateDate: Date;
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

export interface IAMPolicyVersion {
  document: string;
  versionId: string;
  isDefaultVersion: boolean;
  createDate: Date;
}

export interface IAMAccessKey {
  accessKeyId: string;
  secretAccessKey?: string; // Only shown once when created
  userName: string;
  status: 'Active' | 'Inactive';
  createDate: Date;
}

export interface IAMGroup {
  groupName: string;
  groupId: string;
  arn: string;
  path: string;
  createDate: Date;
}

export interface IAMAttachedPolicy {
  policyName: string;
  policyArn: string;
}

// CloudWatch Types
export interface CloudWatchLogGroup {
  logGroupName: string;
  creationTime?: number;
  retentionInDays?: number;
  metricFilterCount?: number;
  arn?: string;
  storedBytes?: number;
  kmsKeyId?: string;
  dataProtectionStatus?: string;
  inheritedProperties?: string[];
}

export interface CloudWatchLogStream {
  logStreamName: string;
  creationTime?: number;
  firstEventTimestamp?: number;
  lastEventTimestamp?: number;
  lastIngestionTime?: number;
  uploadSequenceToken?: string;
  arn?: string;
  storedBytes?: number;
}

export interface CloudWatchLogEvent {
  timestamp: number;
  message: string;
  ingestionTime?: number;
}

export interface CloudWatchMetric {
  namespace?: string;
  metricName?: string;
  dimensions?: CloudWatchDimension[];
  timestamp?: Date;
  value?: number;
  statisticValues?: {
    sampleCount: number;
    sum: number;
    minimum: number;
    maximum: number;
  };
  unit?: string;
  storageResolution?: number;
}

export interface CloudWatchDimension {
  name: string;
  value: string;
}

export interface CloudWatchAlarm {
  alarmName?: string;
  alarmArn?: string;
  alarmDescription?: string;
  alarmConfigurationUpdatedTimestamp?: Date;
  actionsEnabled?: boolean;
  okActions?: string[];
  alarmActions?: string[];
  insufficientDataActions?: string[];
  stateValue?: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  stateReason?: string;
  stateReasonData?: string;
  stateUpdatedTimestamp?: Date;
  metricName?: string;
  namespace?: string;
  statistic?: string;
  extendedStatistic?: string;
  dimensions?: CloudWatchDimension[];
  period?: number;
  unit?: string;
  evaluationPeriods?: number;
  datapointsToAlarm?: number;
  threshold?: number;
  comparisonOperator?: string;
  treatMissingData?: string;
  evaluateLowSampleCountPercentile?: string;
  metrics?: any[];
  thresholdMetricId?: string;
  evaluationState?: string;
  stateTransitionedTimestamp?: Date;
}

export interface CloudWatchAlarmHistory {
  alarmName?: string;
  timestamp?: Date;
  historyItemType?: 'ConfigurationUpdate' | 'StateUpdate' | 'Action';
  historySummary?: string;
  historyData?: string;
}

export interface MetricDataQuery {
  id: string;
  metricStat?: {
    metric: {
      namespace?: string;
      metricName?: string;
      dimensions?: CloudWatchDimension[];
    };
    period: number;
    stat: string;
    unit?: string;
  };
  expression?: string;
  label?: string;
  returnData?: boolean;
  period?: number;
}

export interface MetricDataResult {
  id?: string;
  label?: string;
  timestamps?: Date[];
  values?: number[];
  statusCode?: 'Complete' | 'InternalError' | 'PartialData';
  messages?: string[];
}