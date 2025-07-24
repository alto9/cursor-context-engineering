import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Redis } from 'ioredis';
import {
  AlphaVantageCredentials,
  RateLimitState,
  AlphaVantageResponse,
  CompanyOverview,
  EarningsData,
  CashFlowData,
  BalanceSheetData,
  IncomeStatementData,
  NewsSentimentData,
  AlphaVantageError
} from '../../types/alphavantage';

export class AlphaVantageClient {
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly maxCallsPerDay = 25;
  private readonly minDelayBetweenCalls = 1000; // 1 second
  private readonly redisClient: Redis;
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly secretsClient: SecretsManagerClient;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_ENDPOINT,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Handle connection errors gracefully
      reconnectOnError: (err) => {
        console.warn('Redis connection error, attempting reconnect:', err.message);
        return true;
      }
    });

    this.dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    this.secretsClient = new SecretsManagerClient({});
  }

  /**
   * Retrieve API key from AWS Secrets Manager
   */
  private async getApiKey(): Promise<string> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: process.env.ALPHAVANTAGE_SECRET_NAME || 'signal9-alphavantage-credentials'
      });

      const response = await this.secretsClient.send(command);
      
      if (!response.SecretString) {
        throw new Error('No secret string found in AlphaVantage credentials');
      }

      const credentials: AlphaVantageCredentials = JSON.parse(response.SecretString);
      
      if (!credentials.apiKey) {
        throw new Error('API key not found in AlphaVantage credentials');
      }

      return credentials.apiKey;
    } catch (error) {
      console.error('Error retrieving AlphaVantage API key:', error);
      throw new Error(`Failed to retrieve AlphaVantage API key: ${error}`);
    }
  }

  /**
   * Check rate limiting before making API calls
   */
  private async checkRateLimit(): Promise<boolean> {
    const rateLimitKey = 'alphavantage:rate_limit';
    const today = new Date().toISOString().split('T')[0];

    try {
      const rateLimitData = await this.redisClient.get(rateLimitKey);
      const rateLimitState: RateLimitState = rateLimitData 
        ? JSON.parse(rateLimitData)
        : { callsToday: 0, lastResetDate: '', lastCallTime: 0 };

      // Reset counter if it's a new day
      if (rateLimitState.lastResetDate !== today) {
        rateLimitState.callsToday = 0;
        rateLimitState.lastResetDate = today;
      }

      // Check if we've exceeded daily limit
      if (rateLimitState.callsToday >= this.maxCallsPerDay) {
        throw new Error(`AlphaVantage daily limit exceeded (${this.maxCallsPerDay} calls)`);
      }

      // Enforce minimum delay between calls
      const now = Date.now();
      const timeSinceLastCall = now - rateLimitState.lastCallTime;
      if (timeSinceLastCall < this.minDelayBetweenCalls) {
        const waitTime = this.minDelayBetweenCalls - timeSinceLastCall;
        console.log(`Waiting ${waitTime}ms before next API call to respect rate limits`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // If Redis is down, still allow the call but log the error
      if (error.message.includes('daily limit exceeded')) {
        throw error;
      }
      console.warn('Rate limit checking failed, proceeding with API call');
      return true;
    }
  }

  /**
   * Update rate limiting state after successful API call
   */
  private async updateRateLimit(): Promise<void> {
    const rateLimitKey = 'alphavantage:rate_limit';
    const today = new Date().toISOString().split('T')[0];

    try {
      const rateLimitData = await this.redisClient.get(rateLimitKey);
      const rateLimitState: RateLimitState = rateLimitData 
        ? JSON.parse(rateLimitData)
        : { callsToday: 0, lastResetDate: '', lastCallTime: 0 };

      if (rateLimitState.lastResetDate !== today) {
        rateLimitState.callsToday = 0;
        rateLimitState.lastResetDate = today;
      }

      rateLimitState.callsToday++;
      rateLimitState.lastCallTime = Date.now();

      // Set to expire at end of day (24 hours)
      await this.redisClient.setex(rateLimitKey, 86400, JSON.stringify(rateLimitState));
      
      console.log(`API calls today: ${rateLimitState.callsToday}/${this.maxCallsPerDay}`);
    } catch (error) {
      console.error('Error updating rate limit:', error);
      // Don't throw error here as the API call was successful
    }
  }

  /**
   * Make API call to AlphaVantage with error handling
   */
  private async makeApiCall(
    functionName: string, 
    symbol: string, 
    additionalParams: Record<string, string> = {}
  ): Promise<AlphaVantageResponse> {
    await this.checkRateLimit();

    const apiKey = await this.getApiKey();
    const params = new URLSearchParams({
      function: functionName,
      symbol: symbol,
      apikey: apiKey,
      ...additionalParams
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    
    try {
      console.log(`Making AlphaVantage API call: ${functionName} for ${symbol}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AlphaVantage API HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API-level errors
      if (data['Error Message']) {
        throw new Error(`AlphaVantage API error: ${data['Error Message']}`);
      }

      if (data['Note']) {
        throw new Error(`AlphaVantage API rate limit: ${data['Note']}`);
      }

      if (data['Information']) {
        throw new Error(`AlphaVantage API info: ${data['Information']}`);
      }

      await this.updateRateLimit();
      return data;
    } catch (error) {
      console.error(`AlphaVantage API call failed for ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Get cached data from Redis
   */
  private async getCachedData(cacheKey: string): Promise<any | null> {
    try {
      const cachedData = await this.redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Set cached data in Redis
   */
  private async setCachedData(cacheKey: string, data: any, ttl: number = 86400): Promise<void> {
    try {
      await this.redisClient.setex(cacheKey, ttl, JSON.stringify(data));
      console.log(`Data cached with key: ${cacheKey}, TTL: ${ttl}s`);
    } catch (error) {
      console.error('Error setting cached data:', error);
      // Don't throw error as the main operation was successful
    }
  }

  /**
   * Generate cache key for API responses
   */
  private generateCacheKey(endpoint: string, symbol: string, additionalParams: Record<string, string> = {}): string {
    const params = Object.keys(additionalParams)
      .sort()
      .map(key => `${key}:${additionalParams[key]}`)
      .join(':');
    
    return `alphavantage:${endpoint}:${symbol}:${params}`;
  }

  /**
   * Get company overview data with caching
   */
  async getCompanyOverview(symbol: string): Promise<CompanyOverview> {
    const cacheKey = this.generateCacheKey('overview', symbol);
    
    // Try cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('OVERVIEW', symbol) as CompanyOverview;
    
    // Cache the result (24 hours)
    await this.setCachedData(cacheKey, data, 86400);
    
    return data;
  }

  /**
   * Get earnings data with caching
   */
  async getEarnings(symbol: string): Promise<EarningsData> {
    const cacheKey = this.generateCacheKey('earnings', symbol);
    
    // Try cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('EARNINGS', symbol) as EarningsData;
    
    // Cache the result (24 hours)
    await this.setCachedData(cacheKey, data, 86400);
    
    return data;
  }

  /**
   * Get cash flow data with caching
   */
  async getCashFlow(symbol: string): Promise<CashFlowData> {
    const cacheKey = this.generateCacheKey('cash_flow', symbol);
    
    // Try cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('CASH_FLOW', symbol) as CashFlowData;
    
    // Cache the result (24 hours)
    await this.setCachedData(cacheKey, data, 86400);
    
    return data;
  }

  /**
   * Get balance sheet data with caching
   */
  async getBalanceSheet(symbol: string): Promise<BalanceSheetData> {
    const cacheKey = this.generateCacheKey('balance_sheet', symbol);
    
    // Try cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('BALANCE_SHEET', symbol) as BalanceSheetData;
    
    // Cache the result (24 hours)
    await this.setCachedData(cacheKey, data, 86400);
    
    return data;
  }

  /**
   * Get income statement data with caching
   */
  async getIncomeStatement(symbol: string): Promise<IncomeStatementData> {
    const cacheKey = this.generateCacheKey('income_statement', symbol);
    
    // Try cache first
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('INCOME_STATEMENT', symbol) as IncomeStatementData;
    
    // Cache the result (24 hours)
    await this.setCachedData(cacheKey, data, 86400);
    
    return data;
  }

  /**
   * Get news sentiment data with caching
   */
  async getNewsSentiment(symbol: string): Promise<NewsSentimentData> {
    const cacheKey = this.generateCacheKey('news_sentiment', symbol);
    
    // Try cache first (shorter TTL for news as it's more time-sensitive)
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call
    const data = await this.makeApiCall('NEWS_SENTIMENT', symbol) as NewsSentimentData;
    
    // Cache the result (4 hours for news)
    await this.setCachedData(cacheKey, data, 14400);
    
    return data;
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitState> {
    const rateLimitKey = 'alphavantage:rate_limit';
    const today = new Date().toISOString().split('T')[0];

    try {
      const rateLimitData = await this.redisClient.get(rateLimitKey);
      const rateLimitState: RateLimitState = rateLimitData 
        ? JSON.parse(rateLimitData)
        : { callsToday: 0, lastResetDate: today, lastCallTime: 0 };

      // Reset if new day
      if (rateLimitState.lastResetDate !== today) {
        rateLimitState.callsToday = 0;
        rateLimitState.lastResetDate = today;
      }

      return rateLimitState;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return { callsToday: 0, lastResetDate: today, lastCallTime: 0 };
    }
  }

  /**
   * Clear cache for a specific symbol or pattern
   */
  async clearCache(pattern: string = '*'): Promise<void> {
    try {
      const keys = await this.redisClient.keys(`alphavantage:${pattern}`);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        console.log(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Close connections
   */
  async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit();
      console.log('AlphaVantage client disconnected');
    } catch (error) {
      console.error('Error disconnecting AlphaVantage client:', error);
    }
  }
} 