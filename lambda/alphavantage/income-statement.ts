import { AlphaVantageClient } from '../../lib/alphavantage/client';
import { IncomeStatementValidator } from '../../lib/validators/income-statement-validator';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const alphaVantageClient = new AlphaVantageClient();
const validator = new IncomeStatementValidator();

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
    console.log(`Starting income statement ingestion for symbol: ${symbol}`, {
      requestId,
      symbol,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Symbol is required and must be a string');
    }

    // Get income statement data from AlphaVantage
    console.log(`Fetching income statement data for ${symbol}`);
    const incomeStatementData = await alphaVantageClient.getIncomeStatement(symbol);

    // Validate data using AlphaVantage model
    console.log(`Validating income statement data for ${symbol}`);
    const validatedData = validator.validate(incomeStatementData);

    // Transform data for storage
    const quarterlyIncomeStatement = validator.transformQuarterlyForStorage(validatedData);
    const annualIncomeStatement = validator.transformAnnualForStorage(validatedData);
    
    const allIncomeStatement = [...quarterlyIncomeStatement, ...annualIncomeStatement];

    // Store in DynamoDB using batch operations
    const tableName = process.env.INCOME_STATEMENT_TABLE_NAME;
    if (!tableName) {
      throw new Error('INCOME_STATEMENT_TABLE_NAME environment variable is not set');
    }

    console.log(`Storing ${allIncomeStatement.length} income statement records for ${symbol} in DynamoDB table: ${tableName}`);

    // DynamoDB batch write (max 25 items per batch)
    const batchSize = 25;
    let processedRecords = 0;
    
    for (let i = 0; i < allIncomeStatement.length; i += batchSize) {
      const batch = allIncomeStatement.slice(i, i + batchSize);
      const putRequests = batch.map(item => ({
        PutRequest: { Item: item }
      }));

      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      }));

      processedRecords += batch.length;
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, records: ${processedRecords}/${allIncomeStatement.length}`);
    }

    const processingTime = Date.now() - startTime;
    const successResponse = {
      success: true,
      message: 'Income statement data ingested successfully',
      data: {
        symbol,
        recordsProcessed: processedRecords,
        quarterlyCount: quarterlyIncomeStatement.length,
        annualCount: annualIncomeStatement.length,
        processingTime,
        timestamp: new Date().toISOString(),
        dataQuality: {
          validationStatus: 'success',
          totalRecords: allIncomeStatement.length,
          hasValidData: allIncomeStatement.length > 0
        }
      }
    };

    console.log('Income statement ingestion completed successfully', successResponse);

    return {
      statusCode: 200,
      body: JSON.stringify(successResponse)
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('Error ingesting income statement:', {
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