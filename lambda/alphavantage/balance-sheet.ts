import { AlphaVantageClient } from '../../lib/alphavantage/client';
import { BalanceSheetValidator } from '../../lib/validators/balance-sheet-validator';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const alphaVantageClient = new AlphaVantageClient();
const validator = new BalanceSheetValidator();

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
    console.log(`Starting balance sheet ingestion for symbol: ${symbol}`, {
      requestId,
      symbol,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Symbol is required and must be a string');
    }

    // Get balance sheet data from AlphaVantage
    console.log(`Fetching balance sheet data for ${symbol}`);
    const balanceSheetData = await alphaVantageClient.getBalanceSheet(symbol);

    // Validate data using AlphaVantage model
    console.log(`Validating balance sheet data for ${symbol}`);
    const validatedData = validator.validate(balanceSheetData);

    // Transform data for storage
    const quarterlyBalanceSheet = validator.transformQuarterlyForStorage(validatedData);
    const annualBalanceSheet = validator.transformAnnualForStorage(validatedData);
    
    const allBalanceSheet = [...quarterlyBalanceSheet, ...annualBalanceSheet];

    // Store in DynamoDB using batch operations
    const tableName = process.env.BALANCE_SHEET_TABLE_NAME;
    if (!tableName) {
      throw new Error('BALANCE_SHEET_TABLE_NAME environment variable is not set');
    }

    console.log(`Storing ${allBalanceSheet.length} balance sheet records for ${symbol} in DynamoDB table: ${tableName}`);

    // DynamoDB batch write (max 25 items per batch)
    const batchSize = 25;
    let processedRecords = 0;
    
    for (let i = 0; i < allBalanceSheet.length; i += batchSize) {
      const batch = allBalanceSheet.slice(i, i + batchSize);
      const putRequests = batch.map(item => ({
        PutRequest: { Item: item }
      }));

      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      }));

      processedRecords += batch.length;
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, records: ${processedRecords}/${allBalanceSheet.length}`);
    }

    const processingTime = Date.now() - startTime;
    const successResponse = {
      success: true,
      message: 'Balance sheet data ingested successfully',
      data: {
        symbol,
        recordsProcessed: processedRecords,
        quarterlyCount: quarterlyBalanceSheet.length,
        annualCount: annualBalanceSheet.length,
        processingTime,
        timestamp: new Date().toISOString(),
        dataQuality: {
          validationStatus: 'success',
          totalRecords: allBalanceSheet.length,
          hasValidData: allBalanceSheet.length > 0
        }
      }
    };

    console.log('Balance sheet ingestion completed successfully', successResponse);

    return {
      statusCode: 200,
      body: JSON.stringify(successResponse)
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error('Error ingesting balance sheet:', {
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