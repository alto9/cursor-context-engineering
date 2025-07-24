import { BaseValidator } from './base-validator';
import { CompanyOverview } from '../../types/alphavantage';

export class CompanyOverviewValidator extends BaseValidator {
  validate(data: any): CompanyOverview {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Required fields for company overview
    const requiredFields = [
      'Symbol', 'AssetType', 'Name', 'Description', 'CIK', 'Exchange',
      'Currency', 'Country', 'Sector', 'Industry'
    ];

    this.validateRequiredFields(data, requiredFields);

    // Transform and validate all fields
    const validatedData: CompanyOverview = {
      Symbol: this.validateStringField(data.Symbol, 'Symbol', true)!,
      AssetType: this.validateStringField(data.AssetType, 'AssetType', true)!,
      Name: this.validateStringField(data.Name, 'Name', true)!,
      Description: this.validateStringField(data.Description, 'Description', true)!,
      CIK: this.validateStringField(data.CIK, 'CIK', true)!,
      Exchange: this.validateStringField(data.Exchange, 'Exchange', true)!,
      Currency: this.validateStringField(data.Currency, 'Currency', true)!,
      Country: this.validateStringField(data.Country, 'Country', true)!,
      Sector: this.validateStringField(data.Sector, 'Sector', true)!,
      Industry: this.validateStringField(data.Industry, 'Industry', true)!,
      Address: this.validateStringField(data.Address, 'Address') || '',
      OfficialSite: this.validateStringField(data.OfficialSite, 'OfficialSite') || undefined,
      FiscalYearEnd: this.validateStringField(data.FiscalYearEnd, 'FiscalYearEnd') || '',
      LatestQuarter: this.validateDateField(data.LatestQuarter, 'LatestQuarter') || '',
      MarketCapitalization: String(this.validateNumericField(data.MarketCapitalization, 'MarketCapitalization') || 0),
      EBITDA: String(this.validateNumericField(data.EBITDA, 'EBITDA') || 0),
      PERatio: String(this.validateNumericField(data.PERatio, 'PERatio') || 0),
      PEGRatio: String(this.validateNumericField(data.PEGRatio, 'PEGRatio') || 0),
      BookValue: String(this.validateNumericField(data.BookValue, 'BookValue') || 0),
      DividendPerShare: String(this.validateNumericField(data.DividendPerShare, 'DividendPerShare') || 0),
      DividendYield: String(this.validateNumericField(data.DividendYield, 'DividendYield') || 0),
      EPS: String(this.validateNumericField(data.EPS, 'EPS') || 0),
      RevenuePerShareTTM: String(this.validateNumericField(data.RevenuePerShareTTM, 'RevenuePerShareTTM') || 0),
      ProfitMargin: String(this.validateNumericField(data.ProfitMargin, 'ProfitMargin') || 0),
      OperatingMarginTTM: String(this.validateNumericField(data.OperatingMarginTTM, 'OperatingMarginTTM') || 0),
      ReturnOnAssetsTTM: String(this.validateNumericField(data.ReturnOnAssetsTTM, 'ReturnOnAssetsTTM') || 0),
      ReturnOnEquityTTM: String(this.validateNumericField(data.ReturnOnEquityTTM, 'ReturnOnEquityTTM') || 0),
      RevenueTTM: String(this.validateNumericField(data.RevenueTTM, 'RevenueTTM') || 0),
      GrossProfitTTM: String(this.validateNumericField(data.GrossProfitTTM, 'GrossProfitTTM') || 0),
      DilutedEPSTTM: String(this.validateNumericField(data.DilutedEPSTTM, 'DilutedEPSTTM') || 0),
      QuarterlyEarningsGrowthYOY: String(this.validateNumericField(data.QuarterlyEarningsGrowthYOY, 'QuarterlyEarningsGrowthYOY') || 0),
      QuarterlyRevenueGrowthYOY: String(this.validateNumericField(data.QuarterlyRevenueGrowthYOY, 'QuarterlyRevenueGrowthYOY') || 0),
      AnalystTargetPrice: String(this.validateNumericField(data.AnalystTargetPrice, 'AnalystTargetPrice') || 0),
      AnalystRatingStrongBuy: this.validateStringField(data.AnalystRatingStrongBuy, 'AnalystRatingStrongBuy'),
      AnalystRatingBuy: this.validateStringField(data.AnalystRatingBuy, 'AnalystRatingBuy'),
      AnalystRatingHold: this.validateStringField(data.AnalystRatingHold, 'AnalystRatingHold'),
      AnalystRatingSell: this.validateStringField(data.AnalystRatingSell, 'AnalystRatingSell'),
      AnalystRatingStrongSell: this.validateStringField(data.AnalystRatingStrongSell, 'AnalystRatingStrongSell'),
      TrailingPE: String(this.validateNumericField(data.TrailingPE, 'TrailingPE') || 0),
      ForwardPE: String(this.validateNumericField(data.ForwardPE, 'ForwardPE') || 0),
      PriceToSalesRatioTTM: String(this.validateNumericField(data.PriceToSalesRatioTTM, 'PriceToSalesRatioTTM') || 0),
      PriceToBookRatio: String(this.validateNumericField(data.PriceToBookRatio, 'PriceToBookRatio') || 0),
      EVToRevenue: String(this.validateNumericField(data.EVToRevenue, 'EVToRevenue') || 0),
      EVToEBITDA: String(this.validateNumericField(data.EVToEBITDA, 'EVToEBITDA') || 0),
      Beta: String(this.validateNumericField(data.Beta, 'Beta') || 0),
      "52WeekHigh": String(this.validateNumericField(data['52WeekHigh'], '52WeekHigh') || 0),
      "52WeekLow": String(this.validateNumericField(data['52WeekLow'], '52WeekLow') || 0),
      "50DayMovingAverage": String(this.validateNumericField(data['50DayMovingAverage'], '50DayMovingAverage') || 0),
      "200DayMovingAverage": String(this.validateNumericField(data['200DayMovingAverage'], '200DayMovingAverage') || 0),
      SharesOutstanding: String(this.validateNumericField(data.SharesOutstanding, 'SharesOutstanding') || 0),
      SharesFloat: this.validateStringField(data.SharesFloat, 'SharesFloat'),
      PercentInsiders: this.validateStringField(data.PercentInsiders, 'PercentInsiders'),
      PercentInstitutions: this.validateStringField(data.PercentInstitutions, 'PercentInstitutions'),
      DividendDate: this.validateDateField(data.DividendDate, 'DividendDate'),
      ExDividendDate: this.validateDateField(data.ExDividendDate, 'ExDividendDate')
    };

    return validatedData;
  }

  /**
   * Transform validated data for DynamoDB storage
   */
  transformForStorage(validatedData: CompanyOverview) {
    return {
      symbol: validatedData.Symbol,
      assetType: validatedData.AssetType,
      name: validatedData.Name,
      description: validatedData.Description,
      cik: validatedData.CIK,
      exchange: validatedData.Exchange,
      currency: validatedData.Currency,
      country: validatedData.Country,
      sector: validatedData.Sector,
      industry: validatedData.Industry,
      address: validatedData.Address,
      fiscalYearEnd: validatedData.FiscalYearEnd,
      latestQuarter: this.validateDateField(validatedData.LatestQuarter, 'LatestQuarter'),
      marketCapitalization: this.validateNumericField(validatedData.MarketCapitalization, 'MarketCapitalization'),
      ebitda: this.validateNumericField(validatedData.EBITDA, 'EBITDA'),
      peRatio: this.validateNumericField(validatedData.PERatio, 'PERatio'),
      pegRatio: this.validateNumericField(validatedData.PEGRatio, 'PEGRatio'),
      bookValue: this.validateNumericField(validatedData.BookValue, 'BookValue'),
      dividendPerShare: this.validateNumericField(validatedData.DividendPerShare, 'DividendPerShare'),
      dividendYield: this.validateNumericField(validatedData.DividendYield, 'DividendYield'),
      eps: this.validateNumericField(validatedData.EPS, 'EPS'),
      revenuePerShareTTM: this.validateNumericField(validatedData.RevenuePerShareTTM, 'RevenuePerShareTTM'),
      profitMargin: this.validateNumericField(validatedData.ProfitMargin, 'ProfitMargin'),
      operatingMarginTTM: this.validateNumericField(validatedData.OperatingMarginTTM, 'OperatingMarginTTM'),
      returnOnAssetsTTM: this.validateNumericField(validatedData.ReturnOnAssetsTTM, 'ReturnOnAssetsTTM'),
      returnOnEquityTTM: this.validateNumericField(validatedData.ReturnOnEquityTTM, 'ReturnOnEquityTTM'),
      revenueTTM: this.validateNumericField(validatedData.RevenueTTM, 'RevenueTTM'),
      grossProfitTTM: this.validateNumericField(validatedData.GrossProfitTTM, 'GrossProfitTTM'),
      dilutedEPSTTM: this.validateNumericField(validatedData.DilutedEPSTTM, 'DilutedEPSTTM'),
      quarterlyEarningsGrowthYOY: this.validateNumericField(validatedData.QuarterlyEarningsGrowthYOY, 'QuarterlyEarningsGrowthYOY'),
      quarterlyRevenueGrowthYOY: this.validateNumericField(validatedData.QuarterlyRevenueGrowthYOY, 'QuarterlyRevenueGrowthYOY'),
      analystTargetPrice: this.validateNumericField(validatedData.AnalystTargetPrice, 'AnalystTargetPrice'),
      trailingPE: this.validateNumericField(validatedData.TrailingPE, 'TrailingPE'),
      forwardPE: this.validateNumericField(validatedData.ForwardPE, 'ForwardPE'),
      priceToSalesRatioTTM: this.validateNumericField(validatedData.PriceToSalesRatioTTM, 'PriceToSalesRatioTTM'),
      priceToBookRatio: this.validateNumericField(validatedData.PriceToBookRatio, 'PriceToBookRatio'),
      evToRevenue: this.validateNumericField(validatedData.EVToRevenue, 'EVToRevenue'),
      evToEbitda: this.validateNumericField(validatedData.EVToEBITDA, 'EVToEBITDA'),
      beta: this.validateNumericField(validatedData.Beta, 'Beta'),
      weekHigh52: this.validateNumericField(validatedData["52WeekHigh"], '52WeekHigh'),
      weekLow52: this.validateNumericField(validatedData["52WeekLow"], '52WeekLow'),
      dayMovingAverage50: this.validateNumericField(validatedData["50DayMovingAverage"], '50DayMovingAverage'),
      dayMovingAverage200: this.validateNumericField(validatedData["200DayMovingAverage"], '200DayMovingAverage'),
      sharesOutstanding: this.validateNumericField(validatedData.SharesOutstanding, 'SharesOutstanding'),
      dividendDate: this.validateDateField(validatedData.DividendDate, 'DividendDate'),
      exDividendDate: this.validateDateField(validatedData.ExDividendDate, 'ExDividendDate')
    };
  }
} 