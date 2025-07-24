# AlphaVantage API Integration

## Overview

This module provides a comprehensive integration with the AlphaVantage API for the Signal9 Advisor platform. It includes all 6 required endpoints with proper rate limiting (25 calls/day), data validation, caching, and error handling.

## Features

- **Rate Limiting**: Strict enforcement of AlphaVantage free tier limits (25 calls/day)
- **Caching**: Redis-based caching with configurable TTL to minimize API calls
- **Data Validation**: Comprehensive validation using AlphaVantage models
- **Error Handling**: Robust error handling with exponential backoff
- **Type Safety**: Full TypeScript support with proper interfaces
- **Secrets Management**: Secure API key storage via AWS Secrets Manager

## Components

### 1. AlphaVantage Client (`client.ts`)

The main client class that handles all API interactions:

```typescript
import { AlphaVantageClient } from './client';

const client = new AlphaVantageClient();

// Get company overview data
const overview = await client.getCompanyOverview('IBM');

// Get earnings data  
const earnings = await client.getEarnings('IBM');

// Get current rate limit status
const rateLimitStatus = await client.getRateLimitStatus();
```

#### Key Features:
- Automatic rate limiting with Redis state management
- 1-second minimum delay between API calls
- Comprehensive error handling for API failures
- Automatic caching with configurable TTL
- Connection cleanup and resource management

### 2. Data Validators

Located in `../validators/`, these validate and transform API responses:

- `CompanyOverviewValidator` - Validates OVERVIEW endpoint data
- `EarningsValidator` - Validates EARNINGS endpoint data
- `CashFlowValidator` - Validates CASH_FLOW endpoint data
- `BalanceSheetValidator` - Validates BALANCE_SHEET endpoint data
- `IncomeStatementValidator` - Validates INCOME_STATEMENT endpoint data
- `NewsSentimentValidator` - Validates NEWS_SENTIMENT endpoint data

Each validator includes:
- Field validation and type conversion
- Data transformation for DynamoDB storage
- Error handling for malformed data
- Support for both quarterly and annual data (where applicable)

### 3. Lambda Functions

Six Lambda functions in `../../lambda/alphavantage/` handle data ingestion:

1. **Company Overview** (`company-overview.ts`)
   - Ingests company metadata and financial ratios
   - Stores in `COMPANY_OVERVIEW_TABLE_NAME`

2. **Earnings** (`earnings.ts`)
   - Ingests quarterly and annual earnings data
   - Batch processing for multiple records
   - Stores in `EARNINGS_TABLE_NAME`

3. **Cash Flow** (`cash-flow.ts`)
   - Ingests cash flow statement data
   - Supports quarterly and annual reports
   - Stores in `CASH_FLOW_TABLE_NAME`

4. **Balance Sheet** (`balance-sheet.ts`)
   - Ingests balance sheet data
   - Asset, liability, and equity information
   - Stores in `BALANCE_SHEET_TABLE_NAME`

5. **Income Statement** (`income-statement.ts`)
   - Ingests income statement data
   - Revenue, expense, and profitability metrics
   - Stores in `INCOME_STATEMENT_TABLE_NAME`

6. **News Sentiment** (`news-sentiment.ts`)
   - Ingests news articles with sentiment analysis
   - Sentiment statistics and source tracking
   - Stores in `NEWS_TABLE_NAME`

## Usage

### Environment Variables

Required environment variables for Lambda functions:

```bash
# DynamoDB Table Names
COMPANY_OVERVIEW_TABLE_NAME=signal9-company-overview
EARNINGS_TABLE_NAME=signal9-earnings
CASH_FLOW_TABLE_NAME=signal9-cash-flow
BALANCE_SHEET_TABLE_NAME=signal9-balance-sheet
INCOME_STATEMENT_TABLE_NAME=signal9-income-statement
NEWS_TABLE_NAME=signal9-news

# AlphaVantage Configuration
ALPHAVANTAGE_SECRET_NAME=signal9-alphavantage-credentials

# Redis Configuration
REDIS_ENDPOINT=your-redis-endpoint
REDIS_PORT=6379
```

### AWS Secrets Manager

The AlphaVantage API key should be stored in AWS Secrets Manager:

```json
{
  "apiKey": "your-alphavantage-api-key"
}
```

### Lambda Event Format

All Lambda functions expect the same event format:

```typescript
{
  "symbol": "IBM",
  "requestId": "optional-request-id"
}
```

### Response Format

Success Response:
```typescript
{
  "statusCode": 200,
  "body": JSON.stringify({
    "success": true,
    "message": "Data ingested successfully",
    "data": {
      "symbol": "IBM",
      "recordsProcessed": 25,
      "processingTime": 1500,
      "timestamp": "2024-01-01T00:00:00Z",
      "dataQuality": {
        "validationStatus": "success",
        "totalRecords": 25,
        "hasValidData": true
      }
    }
  })
}
```

Error Response:
```typescript
{
  "statusCode": 429, // or 400, 404, 500
  "body": JSON.stringify({
    "success": false,
    "error": {
      "type": "RATE_LIMIT_ERROR",
      "message": "AlphaVantage daily limit exceeded (25 calls)",
      "symbol": "IBM",
      "timestamp": "2024-01-01T00:00:00Z",
      "processingTime": 500,
      "requestId": "req-123"
    }
  })
}
```

## Rate Limiting

The system enforces AlphaVantage free tier limits:

- **Daily Limit**: 25 API calls per day
- **Call Spacing**: Minimum 1 second between calls
- **State Management**: Redis-based state tracking
- **Auto-Reset**: Daily counter resets at midnight UTC

Rate limit status can be checked:

```typescript
const status = await client.getRateLimitStatus();
console.log(`Calls today: ${status.callsToday}/25`);
```

## Caching Strategy

- **Company Overview**: 24 hours TTL
- **Financial Statements**: 24 hours TTL  
- **Earnings**: 24 hours TTL
- **News Sentiment**: 4 hours TTL (more time-sensitive)

Cache keys follow the pattern: `alphavantage:{endpoint}:{symbol}:{params}`

## Error Handling

The system handles various error scenarios:

1. **API Errors**: AlphaVantage API failures, invalid symbols
2. **Rate Limit Errors**: Daily limit exceeded, too many requests
3. **Validation Errors**: Invalid data format, missing required fields
4. **Storage Errors**: DynamoDB failures, table not found
5. **Network Errors**: Connection timeouts, DNS failures

Each error type has appropriate HTTP status codes and detailed error messages.

## Monitoring

Key metrics to monitor:

- **API Call Count**: Track daily API usage
- **Cache Hit Rate**: Monitor cache effectiveness
- **Error Rates**: Track error types and frequencies
- **Processing Time**: Monitor Lambda execution time
- **Data Quality**: Track validation success rates

## TypeScript Types

All types are defined in `../../types/alphavantage/` and `../../types/dynamodb/`:

- AlphaVantage API response types
- DynamoDB item types
- Lambda event/response types
- Error types and validation interfaces

## Development

### Running Tests

```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Coverage report
```

### Local Development

```bash
# Set up environment variables
cp .env.example .env

# Install dependencies
npm install

# Run TypeScript compiler
npm run build

# Watch mode for development
npm run dev
```

### Deployment

The Lambda functions can be deployed using the CDK infrastructure:

```bash
cdk deploy --context component=alphavantage
```

## Best Practices

1. **Rate Limit Compliance**: Always check rate limits before making API calls
2. **Cache First**: Check cache before making API calls
3. **Error Handling**: Implement proper error handling and logging
4. **Resource Cleanup**: Always disconnect clients after use
5. **Type Safety**: Use TypeScript interfaces for all data structures
6. **Monitoring**: Implement CloudWatch metrics and alarms
7. **Testing**: Maintain >90% test coverage as per project requirements

## Support

For issues or questions regarding the AlphaVantage integration:

1. Check the error logs in CloudWatch
2. Verify environment variables are set correctly
3. Confirm AWS permissions for Secrets Manager and DynamoDB
4. Check Redis connectivity and configuration
5. Verify AlphaVantage API key validity and rate limits 