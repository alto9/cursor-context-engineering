import { BaseValidator } from './base-validator';
import { EarningsData, AnnualEarning, QuarterlyEarning } from '../../types/alphavantage';

export class EarningsValidator extends BaseValidator {
  validate(data: any): EarningsData {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Required fields for earnings data
    const requiredFields = ['symbol'];
    this.validateRequiredFields(data, requiredFields);

    // Validate and transform the data
    const validatedData: EarningsData = {
      symbol: this.validateStringField(data.symbol, 'symbol', true)!,
      annualEarnings: this.validateAnnualEarnings(data.annualEarnings || []),
      quarterlyEarnings: this.validateQuarterlyEarnings(data.quarterlyEarnings || [])
    };

    return validatedData;
  }

  private validateAnnualEarnings(annualEarnings: any[]): AnnualEarning[] {
    if (!Array.isArray(annualEarnings)) {
      console.warn('Annual earnings data is not an array, returning empty array');
      return [];
    }

    return annualEarnings.map((earning, index) => {
      try {
        return {
          fiscalDateEnding: this.validateDateField(earning.fiscalDateEnding, `annualEarnings[${index}].fiscalDateEnding`) || '',
          reportedEPS: this.validateStringField(earning.reportedEPS, `annualEarnings[${index}].reportedEPS`) || '0'
        };
      } catch (error) {
        console.warn(`Error validating annual earning at index ${index}:`, error);
        return {
          fiscalDateEnding: '',
          reportedEPS: '0'
        };
      }
    }).filter(earning => earning.fiscalDateEnding !== ''); // Filter out invalid entries
  }

  private validateQuarterlyEarnings(quarterlyEarnings: any[]): QuarterlyEarning[] {
    if (!Array.isArray(quarterlyEarnings)) {
      console.warn('Quarterly earnings data is not an array, returning empty array');
      return [];
    }

    return quarterlyEarnings.map((earning, index) => {
      try {
        return {
          fiscalDateEnding: this.validateDateField(earning.fiscalDateEnding, `quarterlyEarnings[${index}].fiscalDateEnding`) || '',
          reportedDate: this.validateDateField(earning.reportedDate, `quarterlyEarnings[${index}].reportedDate`) || '',
          reportedEPS: this.validateStringField(earning.reportedEPS, `quarterlyEarnings[${index}].reportedEPS`) || '0',
          estimatedEPS: this.validateStringField(earning.estimatedEPS, `quarterlyEarnings[${index}].estimatedEPS`) || '0',
          surprise: this.validateStringField(earning.surprise, `quarterlyEarnings[${index}].surprise`) || '0',
          surprisePercentage: this.validateStringField(earning.surprisePercentage, `quarterlyEarnings[${index}].surprisePercentage`) || '0',
          reportTime: this.validateEnumField(earning.reportTime, `quarterlyEarnings[${index}].reportTime`, ['pre-market', 'post-market']) || 'post-market'
        };
      } catch (error) {
        console.warn(`Error validating quarterly earning at index ${index}:`, error);
        return {
          fiscalDateEnding: '',
          reportedDate: '',
          reportedEPS: '0',
          estimatedEPS: '0',
          surprise: '0',
          surprisePercentage: '0',
          reportTime: 'post-market'
        };
      }
    }).filter(earning => earning.fiscalDateEnding !== ''); // Filter out invalid entries
  }

  /**
   * Transform validated data for DynamoDB storage (quarterly earnings)
   */
  transformQuarterlyForStorage(validatedData: EarningsData) {
    return validatedData.quarterlyEarnings.map(earning => ({
      asset_id: validatedData.symbol,
      fiscal_date: earning.fiscalDateEnding,
      reported_eps: this.validateNumericField(earning.reportedEPS, 'reportedEPS'),
      estimated_eps: this.validateNumericField(earning.estimatedEPS, 'estimatedEPS'),
      surprise: this.validateNumericField(earning.surprise, 'surprise'),
      surprise_percentage: this.validateNumericField(earning.surprisePercentage, 'surprisePercentage'),
      period_type: 'quarterly',
      reported_date: earning.reportedDate,
      report_time: earning.reportTime,
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }

  /**
   * Transform validated data for DynamoDB storage (annual earnings)
   */
  transformAnnualForStorage(validatedData: EarningsData) {
    return validatedData.annualEarnings.map(earning => ({
      asset_id: validatedData.symbol,
      fiscal_date: earning.fiscalDateEnding,
      reported_eps: this.validateNumericField(earning.reportedEPS, 'reportedEPS'),
      estimated_eps: null,
      surprise: null,
      surprise_percentage: null,
      period_type: 'annual',
      reported_date: null,
      report_time: null,
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }
} 