// DynamoDB Table Item Types

// Company Overview Table
export interface CompanyOverviewItem {
  asset_id: string; // Primary Key
  overview_data: {
    symbol: string;
    assetType: string;
    name: string;
    description: string;
    cik: string;
    exchange: string;
    currency: string;
    country: string;
    sector: string;
    industry: string;
    address: string;
    fiscalYearEnd: string;
    latestQuarter: string | null;
    marketCapitalization: number | null;
    ebitda: number | null;
    peRatio: number | null;
    pegRatio: number | null;
    bookValue: number | null;
    dividendPerShare: number | null;
    dividendYield: number | null;
    eps: number | null;
    revenuePerShareTTM: number | null;
    profitMargin: number | null;
    operatingMarginTTM: number | null;
    returnOnAssetsTTM: number | null;
    returnOnEquityTTM: number | null;
    revenueTTM: number | null;
    grossProfitTTM: number | null;
    dilutedEPSTTM: number | null;
    quarterlyEarningsGrowthYOY: number | null;
    quarterlyRevenueGrowthYOY: number | null;
    analystTargetPrice: number | null;
    trailingPE: number | null;
    forwardPE: number | null;
    priceToSalesRatioTTM: number | null;
    priceToBookRatio: number | null;
    evToRevenue: number | null;
    evToEbitda: number | null;
    beta: number | null;
    weekHigh52: number | null;
    weekLow52: number | null;
    dayMovingAverage50: number | null;
    dayMovingAverage200: number | null;
    sharesOutstanding: number | null;
    dividendDate: string | null;
    exDividendDate: string | null;
  };
  last_updated: string;
  data_source: string;
  version: string;
}

// Earnings Table
export interface EarningsItem {
  asset_id: string; // Primary Key
  fiscal_date: string; // Sort Key
  reported_eps: number | null;
  estimated_eps: number | null;
  surprise: number | null;
  surprise_percentage: number | null;
  period_type?: string; // 'annual' or 'quarterly'
  reported_date?: string;
  report_time?: string;
  last_updated: string;
  data_source: string;
}

// Cash Flow Table
export interface CashFlowItem {
  asset_id: string; // Primary Key
  fiscal_date: string; // Sort Key
  operating_cash_flow: number | null;
  capital_expenditures: number | null;
  cash_flow_from_investment: number | null;
  cash_flow_from_financing: number | null;
  net_income: number | null;
  change_in_cash: number | null;
  change_in_receivables: number | null;
  change_in_inventory: number | null;
  change_in_net_income: number | null;
  depreciation_depletion_amortization: number | null;
  dividend_payout: number | null;
  reported_currency: string;
  period_type?: string; // 'annual' or 'quarterly'
  last_updated: string;
  data_source: string;
}

// Balance Sheet Table
export interface BalanceSheetItem {
  asset_id: string; // Primary Key
  fiscal_date: string; // Sort Key
  total_assets: number | null;
  total_current_assets: number | null;
  cash_and_equivalents: number | null;
  cash_and_short_term_investments: number | null;
  inventory: number | null;
  current_net_receivables: number | null;
  total_liabilities: number | null;
  total_current_liabilities: number | null;
  current_accounts_payable: number | null;
  deferred_revenue: number | null;
  current_debt: number | null;
  short_term_debt: number | null;
  total_shareholder_equity: number | null;
  treasury_stock: number | null;
  retained_earnings: number | null;
  common_stock: number | null;
  common_stock_shares_outstanding: number | null;
  long_term_debt: number | null;
  goodwill: number | null;
  intangible_assets: number | null;
  reported_currency: string;
  period_type?: string; // 'annual' or 'quarterly'
  last_updated: string;
  data_source: string;
}

// Income Statement Table
export interface IncomeStatementItem {
  asset_id: string; // Primary Key
  fiscal_date: string; // Sort Key
  total_revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  net_income: number | null;
  research_and_development: number | null;
  operating_expense: number | null;
  selling_general_and_administrative: number | null;
  other_operating_expenses: number | null;
  interest_expense: number | null;
  income_before_tax: number | null;
  income_tax_expense: number | null;
  net_income_from_continuing_ops: number | null;
  comprehensive_income_net_of_tax: number | null;
  ebit: number | null;
  ebitda: number | null;
  cost_of_revenue: number | null;
  reported_currency: string;
  period_type?: string; // 'annual' or 'quarterly'
  last_updated: string;
  data_source: string;
}

// News Table
export interface NewsItem {
  news_id: string; // Primary Key (URL)
  asset_symbol: string; // GSI
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: number;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: number;
    ticker_sentiment_score: number;
    ticker_sentiment_label: string;
  }>;
  relevance_score?: number;
  last_updated: string;
  data_source: string;
}

// Assets Table (comprehensive)
export interface AssetItem {
  asset_id: string; // Primary Key
  symbol: string; // GSI
  name: string;
  asset_type: string;
  exchange: string;
  currency: string;
  country: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  status: 'active' | 'inactive' | 'delisted';
  tradable: boolean;
  marginable?: boolean;
  shortable?: boolean;
  easy_to_borrow?: boolean;
  fractionable?: boolean;
  attributes?: string[];
  pollenation_needed: boolean;
  last_pollenation: string | null;
  analysis_needed: boolean;
  last_analysis: string | null;
  created_at: string;
  updated_at: string;
  data_source: string;
  metadata?: Record<string, any>;
}

// Users Table
export interface UserItem {
  user_id: string; // Primary Key
  email: string; // GSI
  auth0_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  investment_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_goals: string[];
  preferred_sectors?: string[];
  account_status: 'active' | 'suspended' | 'pending_verification';
  subscription_tier: 'free' | 'premium' | 'enterprise';
  email_verified: boolean;
  marketing_consent: boolean;
  data_processing_consent: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_count: number;
}

// Watchlists Table
export interface WatchlistItem {
  user_id: string; // Primary Key
  watchlist_id: string; // Sort Key
  name: string;
  description?: string;
  is_default: boolean; // GSI
  is_public: boolean;
  asset_count: number;
  color_theme?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// Watchlist Items Table
export interface WatchlistItemItem {
  watchlist_id: string; // Primary Key
  asset_id: string; // Sort Key, GSI
  symbol: string;
  added_at: string;
  sort_order?: number;
  notes?: string;
  alert_enabled: boolean;
  price_alerts?: Array<{
    type: 'above' | 'below';
    price: number;
    enabled: boolean;
  }>;
}

// Asset Analysis Table
export interface AssetAnalysisItem {
  asset_id: string; // Primary Key
  analysis_date: string; // Sort Key
  overall_rating: number; // 1-5 scale, GSI
  confidence_score: number; // 0-1 scale
  financial_health_score: number;
  risk_score: number;
  growth_score: number;
  market_sentiment_score: number;
  value_score: number;
  momentum_score: number;
  quality_score: number;
  sector: string; // GSI
  analysis_summary: string;
  key_strengths: string[];
  key_risks: string[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  target_price?: number;
  price_at_analysis: number;
  analyst_notes?: string;
  model_version: string;
  analysis_duration_ms: number;
  data_completeness_score: number;
  created_at: string;
  expires_at: string;
}

// User Preferences Table
export interface UserPreferenceItem {
  user_id: string; // Primary Key
  preference_key: string; // Sort Key
  preference_value: string | number | boolean | object;
  preference_type: 'string' | 'number' | 'boolean' | 'object';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// Common table operation response types
export interface TableOperationResult {
  success: boolean;
  item?: any;
  error?: string;
  timestamp: string;
}

export interface BatchOperationResult {
  success: boolean;
  processedItems: number;
  failedItems: number;
  errors?: string[];
  timestamp: string;
}

// Query and Scan result types
export interface QueryResult<T> {
  items: T[];
  count: number;
  scannedCount?: number;
  lastEvaluatedKey?: Record<string, any>;
  consumedCapacity?: any;
}

export interface ScanResult<T> {
  items: T[];
  count: number;
  scannedCount: number;
  lastEvaluatedKey?: Record<string, any>;
  consumedCapacity?: any;
} 