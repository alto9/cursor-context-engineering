import { AlphaVantageClient } from '../../lib/alphavantage/client';
import { CompanyOverviewValidator } from '../../lib/validators/company-overview-validator';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const alphaVantageClient = new AlphaVantageClient();
const validator = new CompanyOverviewValidator();

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
    console.log(`Starting company overview ingestion for symbol: ${symbol}`, {
      requestId,
      symbol,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Symbol is required and must be a string');
    }

    // Get company overview data from AlphaVantage
    console.log(`Fetching company overview data for ${symbol}`);
    const overviewData = await alphaVantageClient.getCompanyOverview(symbol);

    // Validate data using AlphaVantage model
    console.log(`Validating company overview data for ${symbol}`);
    const validatedData = validator.validate(overviewData);

    // Transform data for storage
    const transformedData = validator.transformForStorage(validatedData);

    // Create DynamoDB item
    const item = {
      asset_id: symbol,
      overview_data: transformedData,
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage',
      version: '1.0',
      ingestion_metadata: {
        requestId,
        processingTime: Date.now() - startTime,
        validationStatus: 'success'
      }
    };

    // Store in DynamoDB
    const tableName = process.env.COMPANY_OVERVIEW_TABLE_NAME;
    if (!tableName) {
      throw new Error('COMPANY_OVERVIEW_TABLE_NAME environment variable is not set');
    }

    console.log(`Storing company overview data for ${symbol} in DynamoDB table: ${tableName}`);
    await dynamoClient.send(new PutCommand({
      TableName: tableName,
      Item: item
    }));

    const processingTime = Date.now() - startTime;
    const successResponse = {
      success: true,
      message: 'Company overview data ingested successfully',
      data: {
        symbol,
        recordsProcessed: 1,
        processingTime,
        timestamp: new Date().toISOString(),
        dataQuality: {
          validationStatus: 'success',
          fieldCount: Object.keys(transformedData).length,
          hasRequiredFields: true
        }
      }
    };

    console.log('Company overview ingestion completed successfully', successResponse);

    return {
      statusCode: 200,
      body: JSON.stringify(successResponse)
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('Error ingesting company overview:', {
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