// AlphaVantage Lambda Functions
// Export all Lambda handlers for easier deployment and testing

export { handler as companyOverviewHandler } from './company-overview';
export { handler as earningsHandler } from './earnings';
export { handler as cashFlowHandler } from './cash-flow';
export { handler as balanceSheetHandler } from './balance-sheet';
export { handler as incomeStatementHandler } from './income-statement';
export { handler as newsSentimentHandler } from './news-sentiment';

// Types for Lambda events and responses
export interface AlphaVantageEvent {
  symbol: string;
  requestId?: string;
}

export interface AlphaVantageResponse {
  statusCode: number;
  body: string;
}

// Environment variables required by Lambda functions
export interface AlphaVantageEnvironment {
  COMPANY_OVERVIEW_TABLE_NAME: string;
  EARNINGS_TABLE_NAME: string;
  CASH_FLOW_TABLE_NAME: string;
  BALANCE_SHEET_TABLE_NAME: string;
  INCOME_STATEMENT_TABLE_NAME: string;
  NEWS_TABLE_NAME: string;
  ALPHAVANTAGE_SECRET_NAME: string;
  REDIS_ENDPOINT: string;
  REDIS_PORT: string;
}

// Common error types returned by Lambda functions
export type AlphaVantageErrorType = 
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'UNKNOWN_ERROR'; 