import { BaseValidator } from './base-validator';
import { CashFlowData, CashFlowReport } from '../../types/alphavantage';

export class CashFlowValidator extends BaseValidator {
  validate(data: any): CashFlowData {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Required fields for cash flow data
    const requiredFields = ['symbol'];
    this.validateRequiredFields(data, requiredFields);

    // Validate and transform the data
    const validatedData: CashFlowData = {
      symbol: this.validateStringField(data.symbol, 'symbol', true)!,
      annualReports: this.validateCashFlowReports(data.annualReports || [], 'annual'),
      quarterlyReports: this.validateCashFlowReports(data.quarterlyReports || [], 'quarterly')
    };

    return validatedData;
  }

  private validateCashFlowReports(reports: any[], reportType: string): CashFlowReport[] {
    if (!Array.isArray(reports)) {
      console.warn(`${reportType} cash flow reports data is not an array, returning empty array`);
      return [];
    }

    return reports.map((report, index) => {
      try {
        return {
          fiscalDateEnding: this.validateDateField(report.fiscalDateEnding, `${reportType}Reports[${index}].fiscalDateEnding`) || '',
          reportedCurrency: this.validateStringField(report.reportedCurrency, `${reportType}Reports[${index}].reportedCurrency`) || 'USD',
          operatingCashflow: this.validateStringField(report.operatingCashflow, `${reportType}Reports[${index}].operatingCashflow`) || '0',
          paymentsForOperatingActivities: this.validateStringField(report.paymentsForOperatingActivities, `${reportType}Reports[${index}].paymentsForOperatingActivities`) || 'None',
          proceedsFromOperatingActivities: this.validateStringField(report.proceedsFromOperatingActivities, `${reportType}Reports[${index}].proceedsFromOperatingActivities`) || 'None',
          changeInOperatingLiabilities: this.validateStringField(report.changeInOperatingLiabilities, `${reportType}Reports[${index}].changeInOperatingLiabilities`) || 'None',
          changeInOperatingAssets: this.validateStringField(report.changeInOperatingAssets, `${reportType}Reports[${index}].changeInOperatingAssets`) || 'None',
          depreciationDepletionAndAmortization: this.validateStringField(report.depreciationDepletionAndAmortization, `${reportType}Reports[${index}].depreciationDepletionAndAmortization`) || '0',
          capitalExpenditures: this.validateStringField(report.capitalExpenditures, `${reportType}Reports[${index}].capitalExpenditures`) || '0',
          changeInReceivables: this.validateStringField(report.changeInReceivables, `${reportType}Reports[${index}].changeInReceivables`) || 'None',
          changeInInventory: this.validateStringField(report.changeInInventory, `${reportType}Reports[${index}].changeInInventory`) || '0',
          profitLoss: this.validateStringField(report.profitLoss, `${reportType}Reports[${index}].profitLoss`) || 'None',
          cashflowFromInvestment: this.validateStringField(report.cashflowFromInvestment, `${reportType}Reports[${index}].cashflowFromInvestment`) || 'None',
          cashflowFromFinancing: this.validateStringField(report.cashflowFromFinancing, `${reportType}Reports[${index}].cashflowFromFinancing`) || '0',
          proceedsFromRepaymentsOfShortTermDebt: this.validateStringField(report.proceedsFromRepaymentsOfShortTermDebt, `${reportType}Reports[${index}].proceedsFromRepaymentsOfShortTermDebt`) || 'None',
          paymentsForRepurchaseOfCommonStock: this.validateStringField(report.paymentsForRepurchaseOfCommonStock, `${reportType}Reports[${index}].paymentsForRepurchaseOfCommonStock`) || 'None',
          paymentsForRepurchaseOfEquity: this.validateStringField(report.paymentsForRepurchaseOfEquity, `${reportType}Reports[${index}].paymentsForRepurchaseOfEquity`) || 'None',
          paymentsForRepurchaseOfPreferredStock: this.validateStringField(report.paymentsForRepurchaseOfPreferredStock, `${reportType}Reports[${index}].paymentsForRepurchaseOfPreferredStock`) || 'None',
          dividendPayout: this.validateStringField(report.dividendPayout, `${reportType}Reports[${index}].dividendPayout`) || '0',
          dividendPayoutCommonStock: this.validateStringField(report.dividendPayoutCommonStock, `${reportType}Reports[${index}].dividendPayoutCommonStock`) || '0',
          dividendPayoutPreferredStock: this.validateStringField(report.dividendPayoutPreferredStock, `${reportType}Reports[${index}].dividendPayoutPreferredStock`) || 'None',
          proceedsFromIssuanceOfCommonStock: this.validateStringField(report.proceedsFromIssuanceOfCommonStock, `${reportType}Reports[${index}].proceedsFromIssuanceOfCommonStock`) || 'None',
          proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: this.validateStringField(report.proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet, `${reportType}Reports[${index}].proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet`) || 'None',
          proceedsFromIssuanceOfPreferredStock: this.validateStringField(report.proceedsFromIssuanceOfPreferredStock, `${reportType}Reports[${index}].proceedsFromIssuanceOfPreferredStock`) || 'None',
          proceedsFromRepurchaseOfEquity: this.validateStringField(report.proceedsFromRepurchaseOfEquity, `${reportType}Reports[${index}].proceedsFromRepurchaseOfEquity`) || '0',
          proceedsFromSaleOfTreasuryStock: this.validateStringField(report.proceedsFromSaleOfTreasuryStock, `${reportType}Reports[${index}].proceedsFromSaleOfTreasuryStock`) || 'None',
          changeInCashAndCashEquivalents: this.validateStringField(report.changeInCashAndCashEquivalents, `${reportType}Reports[${index}].changeInCashAndCashEquivalents`) || 'None',
          changeInExchangeRate: this.validateStringField(report.changeInExchangeRate, `${reportType}Reports[${index}].changeInExchangeRate`) || 'None',
          netIncome: this.validateStringField(report.netIncome, `${reportType}Reports[${index}].netIncome`) || '0'
        };
      } catch (error) {
        console.warn(`Error validating ${reportType} cash flow report at index ${index}:`, error);
        return {
          fiscalDateEnding: '',
          reportedCurrency: 'USD',
          operatingCashflow: '0',
          paymentsForOperatingActivities: 'None',
          proceedsFromOperatingActivities: 'None',
          changeInOperatingLiabilities: 'None',
          changeInOperatingAssets: 'None',
          depreciationDepletionAndAmortization: '0',
          capitalExpenditures: '0',
          changeInReceivables: 'None',
          changeInInventory: '0',
          profitLoss: 'None',
          cashflowFromInvestment: 'None',
          cashflowFromFinancing: '0',
          proceedsFromRepaymentsOfShortTermDebt: 'None',
          paymentsForRepurchaseOfCommonStock: 'None',
          paymentsForRepurchaseOfEquity: 'None',
          paymentsForRepurchaseOfPreferredStock: 'None',
          dividendPayout: '0',
          dividendPayoutCommonStock: '0',
          dividendPayoutPreferredStock: 'None',
          proceedsFromIssuanceOfCommonStock: 'None',
          proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: 'None',
          proceedsFromIssuanceOfPreferredStock: 'None',
          proceedsFromRepurchaseOfEquity: '0',
          proceedsFromSaleOfTreasuryStock: 'None',
          changeInCashAndCashEquivalents: 'None',
          changeInExchangeRate: 'None',
          netIncome: '0'
        };
      }
    }).filter(report => report.fiscalDateEnding !== ''); // Filter out invalid entries
  }

  /**
   * Transform validated data for DynamoDB storage (quarterly reports)
   */
  transformQuarterlyForStorage(validatedData: CashFlowData) {
    return validatedData.quarterlyReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      operating_cash_flow: this.validateNumericField(report.operatingCashflow, 'operatingCashflow'),
      capital_expenditures: this.validateNumericField(report.capitalExpenditures, 'capitalExpenditures'),
      cash_flow_from_investment: this.validateNumericField(report.cashflowFromInvestment, 'cashflowFromInvestment'),
      cash_flow_from_financing: this.validateNumericField(report.cashflowFromFinancing, 'cashflowFromFinancing'),
      net_income: this.validateNumericField(report.netIncome, 'netIncome'),
      change_in_cash: this.validateNumericField(report.changeInCashAndCashEquivalents, 'changeInCashAndCashEquivalents'),
      change_in_receivables: this.validateNumericField(report.changeInReceivables, 'changeInReceivables'),
      change_in_inventory: this.validateNumericField(report.changeInInventory, 'changeInInventory'),
      change_in_net_income: null, // Not directly available in cash flow data
      depreciation_depletion_amortization: this.validateNumericField(report.depreciationDepletionAndAmortization, 'depreciationDepletionAndAmortization'),
      dividend_payout: this.validateNumericField(report.dividendPayout, 'dividendPayout'),
      reported_currency: report.reportedCurrency,
      period_type: 'quarterly',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }

  /**
   * Transform validated data for DynamoDB storage (annual reports)
   */
  transformAnnualForStorage(validatedData: CashFlowData) {
    return validatedData.annualReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      operating_cash_flow: this.validateNumericField(report.operatingCashflow, 'operatingCashflow'),
      capital_expenditures: this.validateNumericField(report.capitalExpenditures, 'capitalExpenditures'),
      cash_flow_from_investment: this.validateNumericField(report.cashflowFromInvestment, 'cashflowFromInvestment'),
      cash_flow_from_financing: this.validateNumericField(report.cashflowFromFinancing, 'cashflowFromFinancing'),
      net_income: this.validateNumericField(report.netIncome, 'netIncome'),
      change_in_cash: this.validateNumericField(report.changeInCashAndCashEquivalents, 'changeInCashAndCashEquivalents'),
      change_in_receivables: this.validateNumericField(report.changeInReceivables, 'changeInReceivables'),
      change_in_inventory: this.validateNumericField(report.changeInInventory, 'changeInInventory'),
      change_in_net_income: null, // Not directly available in cash flow data
      depreciation_depletion_amortization: this.validateNumericField(report.depreciationDepletionAndAmortization, 'depreciationDepletionAndAmortization'),
      dividend_payout: this.validateNumericField(report.dividendPayout, 'dividendPayout'),
      reported_currency: report.reportedCurrency,
      period_type: 'annual',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }
} 