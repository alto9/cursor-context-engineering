import { AlphaVantageClient } from '../../lib/alphavantage/client';
import { NewsSentimentValidator } from '../../lib/validators/news-sentiment-validator';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const alphaVantageClient = new AlphaVantageClient();
const validator = new NewsSentimentValidator();

interface LambdaEvent {
  symbol: string;
  requestId?: string;
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  const { symbol, requestId } = event;
  const startTime = Date.now();

  try {
    console.log(`Starting news sentiment ingestion for symbol: ${symbol}`, {
      requestId,
      symbol,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Symbol is required and must be a string');
    }

    // Get news sentiment data from AlphaVantage
    console.log(`Fetching news sentiment data for ${symbol}`);
    const newsSentimentData = await alphaVantageClient.getNewsSentiment(symbol);

    // Validate data using AlphaVantage model
    console.log(`Validating news sentiment data for ${symbol}`);
    const validatedData = validator.validate(newsSentimentData);

    // Transform data for storage
    const newsItems = validator.transformForStorage(validatedData, symbol);

    // Store in DynamoDB using batch operations
    const tableName = process.env.NEWS_TABLE_NAME;
    if (!tableName) {
      throw new Error('NEWS_TABLE_NAME environment variable is not set');
    }

    console.log(`Storing ${newsItems.length} news items for ${symbol} in DynamoDB table: ${tableName}`);

    // DynamoDB batch write (max 25 items per batch)
    const batchSize = 25;
    let processedRecords = 0;
    
    for (let i = 0; i < newsItems.length; i += batchSize) {
      const batch = newsItems.slice(i, i + batchSize);
      const putRequests = batch.map(item => ({
        PutRequest: { Item: item }
      }));

      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      }));

      processedRecords += batch.length;
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, records: ${processedRecords}/${newsItems.length}`);
    }

    const processingTime = Date.now() - startTime;
    
    // Calculate sentiment statistics
    const sentimentStats = {
      totalArticles: newsItems.length,
      bullishCount: newsItems.filter(item => item.overall_sentiment_label.toLowerCase().includes('bullish')).length,
      bearishCount: newsItems.filter(item => item.overall_sentiment_label.toLowerCase().includes('bearish')).length,
      neutralCount: newsItems.filter(item => item.overall_sentiment_label.toLowerCase().includes('neutral')).length,
      averageSentimentScore: newsItems.reduce((sum, item) => sum + item.overall_sentiment_score, 0) / newsItems.length
    };

    const successResponse = {
      success: true,
      message: 'News sentiment data ingested successfully',
      data: {
        symbol,
        recordsProcessed: processedRecords,
        processingTime,
        timestamp: new Date().toISOString(),
        sentimentAnalysis: sentimentStats,
        dataQuality: {
          validationStatus: 'success',
          totalRecords: newsItems.length,
          hasValidData: newsItems.length > 0,
          uniqueSources: [...new Set(newsItems.map(item => item.source))].length
        }
      }
    };

    console.log('News sentiment ingestion completed successfully', successResponse);

    return {
      statusCode: 200,
      body: JSON.stringify(successResponse)
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('Error ingesting news sentiment:', {
      symbol,
      error: error.message,
      stack: error.stack,
      processingTime,
      requestId
    });

    // Log specific error types for monitoring
    let errorType = 'UNKNOWN_ERROR';
    if (error.message.includes('AlphaVantage')) {
      errorType = 'API_ERROR';
    } else if (error.message.includes('validation')) {
      errorType = 'VALIDATION_ERROR';
    } else if (error.message.includes('DynamoDB') || error.message.includes('TABLE_NAME')) {
      errorType = 'STORAGE_ERROR';
    } else if (error.message.includes('rate limit')) {
      errorType = 'RATE_LIMIT_ERROR';
    }

    const errorResponse = {
      success: false,
      error: {
        type: errorType,
        message: error.message,
        symbol,
        timestamp: new Date().toISOString(),
        processingTime,
        requestId
      }
    };

    // Return appropriate HTTP status codes based on error type
    let statusCode = 500;
    if (errorType === 'RATE_LIMIT_ERROR') {
      statusCode = 429;
    } else if (errorType === 'VALIDATION_ERROR') {
      statusCode = 400;
    } else if (errorType === 'API_ERROR' && error.message.includes('not found')) {
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify(errorResponse)
    };
  } finally {
    // Clean up connections
    try {
      await alphaVantageClient.disconnect();
    } catch (cleanupError) {
      console.warn('Error during cleanup:', cleanupError);
    }
  }
}; 