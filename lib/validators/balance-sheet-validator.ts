import { BaseValidator } from './base-validator';
import { BalanceSheetData, BalanceSheetReport } from '../../types/alphavantage';

export class BalanceSheetValidator extends BaseValidator {
  validate(data: any): BalanceSheetData {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Required fields for balance sheet data
    const requiredFields = ['symbol'];
    this.validateRequiredFields(data, requiredFields);

    // Validate and transform the data
    const validatedData: BalanceSheetData = {
      symbol: this.validateStringField(data.symbol, 'symbol', true)!,
      annualReports: this.validateBalanceSheetReports(data.annualReports || [], 'annual'),
      quarterlyReports: this.validateBalanceSheetReports(data.quarterlyReports || [], 'quarterly')
    };

    return validatedData;
  }

  private validateBalanceSheetReports(reports: any[], reportType: string): BalanceSheetReport[] {
    if (!Array.isArray(reports)) {
      console.warn(`${reportType} balance sheet reports data is not an array, returning empty array`);
      return [];
    }

    return reports.map((report, index) => {
      try {
        return {
          fiscalDateEnding: this.validateDateField(report.fiscalDateEnding, `${reportType}Reports[${index}].fiscalDateEnding`) || '',
          reportedCurrency: this.validateStringField(report.reportedCurrency, `${reportType}Reports[${index}].reportedCurrency`) || 'USD',
          totalAssets: this.validateStringField(report.totalAssets, `${reportType}Reports[${index}].totalAssets`) || '0',
          totalCurrentAssets: this.validateStringField(report.totalCurrentAssets, `${reportType}Reports[${index}].totalCurrentAssets`) || '0',
          cashAndCashEquivalentsAtCarryingValue: this.validateStringField(report.cashAndCashEquivalentsAtCarryingValue, `${reportType}Reports[${index}].cashAndCashEquivalentsAtCarryingValue`) || '0',
          cashAndShortTermInvestments: this.validateStringField(report.cashAndShortTermInvestments, `${reportType}Reports[${index}].cashAndShortTermInvestments`) || '0',
          inventory: this.validateStringField(report.inventory, `${reportType}Reports[${index}].inventory`) || '0',
          currentNetReceivables: this.validateStringField(report.currentNetReceivables, `${reportType}Reports[${index}].currentNetReceivables`) || '0',
          totalNonCurrentAssets: this.validateStringField(report.totalNonCurrentAssets, `${reportType}Reports[${index}].totalNonCurrentAssets`) || '0',
          propertyPlantEquipment: this.validateStringField(report.propertyPlantEquipment, `${reportType}Reports[${index}].propertyPlantEquipment`) || 'None',
          accumulatedDepreciationAmortizationPPE: this.validateStringField(report.accumulatedDepreciationAmortizationPPE, `${reportType}Reports[${index}].accumulatedDepreciationAmortizationPPE`) || 'None',
          intangibleAssets: this.validateStringField(report.intangibleAssets, `${reportType}Reports[${index}].intangibleAssets`) || '0',
          intangibleAssetsExcludingGoodwill: this.validateStringField(report.intangibleAssetsExcludingGoodwill, `${reportType}Reports[${index}].intangibleAssetsExcludingGoodwill`) || '0',
          goodwill: this.validateStringField(report.goodwill, `${reportType}Reports[${index}].goodwill`) || '0',
          investments: this.validateStringField(report.investments, `${reportType}Reports[${index}].investments`) || 'None',
          longTermInvestments: this.validateStringField(report.longTermInvestments, `${reportType}Reports[${index}].longTermInvestments`) || 'None',
          shortTermInvestments: this.validateStringField(report.shortTermInvestments, `${reportType}Reports[${index}].shortTermInvestments`) || '0',
          otherCurrentAssets: this.validateStringField(report.otherCurrentAssets, `${reportType}Reports[${index}].otherCurrentAssets`) || '0',
          otherNonCurrentAssets: this.validateStringField(report.otherNonCurrentAssets, `${reportType}Reports[${index}].otherNonCurrentAssets`) || 'None',
          totalLiabilities: this.validateStringField(report.totalLiabilities, `${reportType}Reports[${index}].totalLiabilities`) || '0',
          totalCurrentLiabilities: this.validateStringField(report.totalCurrentLiabilities, `${reportType}Reports[${index}].totalCurrentLiabilities`) || '0',
          currentAccountsPayable: this.validateStringField(report.currentAccountsPayable, `${reportType}Reports[${index}].currentAccountsPayable`) || '0',
          deferredRevenue: this.validateStringField(report.deferredRevenue, `${reportType}Reports[${index}].deferredRevenue`) || 'None',
          currentDebt: this.validateStringField(report.currentDebt, `${reportType}Reports[${index}].currentDebt`) || 'None',
          shortTermDebt: this.validateStringField(report.shortTermDebt, `${reportType}Reports[${index}].shortTermDebt`) || '0',
          totalNonCurrentLiabilities: this.validateStringField(report.totalNonCurrentLiabilities, `${reportType}Reports[${index}].totalNonCurrentLiabilities`) || '0',
          capitalLeaseObligations: this.validateStringField(report.capitalLeaseObligations, `${reportType}Reports[${index}].capitalLeaseObligations`) || '0',
          longTermDebt: this.validateStringField(report.longTermDebt, `${reportType}Reports[${index}].longTermDebt`) || '0',
          currentLongTermDebt: this.validateStringField(report.currentLongTermDebt, `${reportType}Reports[${index}].currentLongTermDebt`) || '0',
          longTermDebtNoncurrent: this.validateStringField(report.longTermDebtNoncurrent, `${reportType}Reports[${index}].longTermDebtNoncurrent`) || 'None',
          shortLongTermDebtTotal: this.validateStringField(report.shortLongTermDebtTotal, `${reportType}Reports[${index}].shortLongTermDebtTotal`) || '0',
          otherCurrentLiabilities: this.validateStringField(report.otherCurrentLiabilities, `${reportType}Reports[${index}].otherCurrentLiabilities`) || '0',
          otherNonCurrentLiabilities: this.validateStringField(report.otherNonCurrentLiabilities, `${reportType}Reports[${index}].otherNonCurrentLiabilities`) || '0',
          totalShareholderEquity: this.validateStringField(report.totalShareholderEquity, `${reportType}Reports[${index}].totalShareholderEquity`) || '0',
          treasuryStock: this.validateStringField(report.treasuryStock, `${reportType}Reports[${index}].treasuryStock`) || 'None',
          retainedEarnings: this.validateStringField(report.retainedEarnings, `${reportType}Reports[${index}].retainedEarnings`) || '0',
          commonStock: this.validateStringField(report.commonStock, `${reportType}Reports[${index}].commonStock`) || '0',
          commonStockSharesOutstanding: this.validateStringField(report.commonStockSharesOutstanding, `${reportType}Reports[${index}].commonStockSharesOutstanding`) || '0'
        };
      } catch (error) {
        console.warn(`Error validating ${reportType} balance sheet report at index ${index}:`, error);
        return {
          fiscalDateEnding: '',
          reportedCurrency: 'USD',
          totalAssets: '0',
          totalCurrentAssets: '0',
          cashAndCashEquivalentsAtCarryingValue: '0',
          cashAndShortTermInvestments: '0',
          inventory: '0',
          currentNetReceivables: '0',
          totalNonCurrentAssets: '0',
          propertyPlantEquipment: 'None',
          accumulatedDepreciationAmortizationPPE: 'None',
          intangibleAssets: '0',
          intangibleAssetsExcludingGoodwill: '0',
          goodwill: '0',
          investments: 'None',
          longTermInvestments: 'None',
          shortTermInvestments: '0',
          otherCurrentAssets: '0',
          otherNonCurrentAssets: 'None',
          totalLiabilities: '0',
          totalCurrentLiabilities: '0',
          currentAccountsPayable: '0',
          deferredRevenue: 'None',
          currentDebt: 'None',
          shortTermDebt: '0',
          totalNonCurrentLiabilities: '0',
          capitalLeaseObligations: '0',
          longTermDebt: '0',
          currentLongTermDebt: '0',
          longTermDebtNoncurrent: 'None',
          shortLongTermDebtTotal: '0',
          otherCurrentLiabilities: '0',
          otherNonCurrentLiabilities: '0',
          totalShareholderEquity: '0',
          treasuryStock: 'None',
          retainedEarnings: '0',
          commonStock: '0',
          commonStockSharesOutstanding: '0'
        };
      }
    }).filter(report => report.fiscalDateEnding !== ''); // Filter out invalid entries
  }

  /**
   * Transform validated data for DynamoDB storage (quarterly reports)
   */
  transformQuarterlyForStorage(validatedData: BalanceSheetData) {
    return validatedData.quarterlyReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      total_assets: this.validateNumericField(report.totalAssets, 'totalAssets'),
      total_current_assets: this.validateNumericField(report.totalCurrentAssets, 'totalCurrentAssets'),
      cash_and_equivalents: this.validateNumericField(report.cashAndCashEquivalentsAtCarryingValue, 'cashAndCashEquivalentsAtCarryingValue'),
      cash_and_short_term_investments: this.validateNumericField(report.cashAndShortTermInvestments, 'cashAndShortTermInvestments'),
      inventory: this.validateNumericField(report.inventory, 'inventory'),
      current_net_receivables: this.validateNumericField(report.currentNetReceivables, 'currentNetReceivables'),
      total_liabilities: this.validateNumericField(report.totalLiabilities, 'totalLiabilities'),
      total_current_liabilities: this.validateNumericField(report.totalCurrentLiabilities, 'totalCurrentLiabilities'),
      current_accounts_payable: this.validateNumericField(report.currentAccountsPayable, 'currentAccountsPayable'),
      deferred_revenue: this.validateNumericField(report.deferredRevenue, 'deferredRevenue'),
      current_debt: this.validateNumericField(report.currentDebt, 'currentDebt'),
      short_term_debt: this.validateNumericField(report.shortTermDebt, 'shortTermDebt'),
      total_shareholder_equity: this.validateNumericField(report.totalShareholderEquity, 'totalShareholderEquity'),
      treasury_stock: this.validateNumericField(report.treasuryStock, 'treasuryStock'),
      retained_earnings: this.validateNumericField(report.retainedEarnings, 'retainedEarnings'),
      common_stock: this.validateNumericField(report.commonStock, 'commonStock'),
      common_stock_shares_outstanding: this.validateNumericField(report.commonStockSharesOutstanding, 'commonStockSharesOutstanding'),
      long_term_debt: this.validateNumericField(report.longTermDebt, 'longTermDebt'),
      goodwill: this.validateNumericField(report.goodwill, 'goodwill'),
      intangible_assets: this.validateNumericField(report.intangibleAssets, 'intangibleAssets'),
      reported_currency: report.reportedCurrency,
      period_type: 'quarterly',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }

  /**
   * Transform validated data for DynamoDB storage (annual reports)
   */
  transformAnnualForStorage(validatedData: BalanceSheetData) {
    return validatedData.annualReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      total_assets: this.validateNumericField(report.totalAssets, 'totalAssets'),
      total_current_assets: this.validateNumericField(report.totalCurrentAssets, 'totalCurrentAssets'),
      cash_and_equivalents: this.validateNumericField(report.cashAndCashEquivalentsAtCarryingValue, 'cashAndCashEquivalentsAtCarryingValue'),
      cash_and_short_term_investments: this.validateNumericField(report.cashAndShortTermInvestments, 'cashAndShortTermInvestments'),
      inventory: this.validateNumericField(report.inventory, 'inventory'),
      current_net_receivables: this.validateNumericField(report.currentNetReceivables, 'currentNetReceivables'),
      total_liabilities: this.validateNumericField(report.totalLiabilities, 'totalLiabilities'),
      total_current_liabilities: this.validateNumericField(report.totalCurrentLiabilities, 'totalCurrentLiabilities'),
      current_accounts_payable: this.validateNumericField(report.currentAccountsPayable, 'currentAccountsPayable'),
      deferred_revenue: this.validateNumericField(report.deferredRevenue, 'deferredRevenue'),
      current_debt: this.validateNumericField(report.currentDebt, 'currentDebt'),
      short_term_debt: this.validateNumericField(report.shortTermDebt, 'shortTermDebt'),
      total_shareholder_equity: this.validateNumericField(report.totalShareholderEquity, 'totalShareholderEquity'),
      treasury_stock: this.validateNumericField(report.treasuryStock, 'treasuryStock'),
      retained_earnings: this.validateNumericField(report.retainedEarnings, 'retainedEarnings'),
      common_stock: this.validateNumericField(report.commonStock, 'commonStock'),
      common_stock_shares_outstanding: this.validateNumericField(report.commonStockSharesOutstanding, 'commonStockSharesOutstanding'),
      long_term_debt: this.validateNumericField(report.longTermDebt, 'longTermDebt'),
      goodwill: this.validateNumericField(report.goodwill, 'goodwill'),
      intangible_assets: this.validateNumericField(report.intangibleAssets, 'intangibleAssets'),
      reported_currency: report.reportedCurrency,
      period_type: 'annual',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }
} 