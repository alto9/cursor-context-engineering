import { BaseValidator } from './base-validator';
import { IncomeStatementData, IncomeStatementReport } from '../../types/alphavantage';

export class IncomeStatementValidator extends BaseValidator {
  validate(data: any): IncomeStatementData {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Required fields for income statement data
    const requiredFields = ['symbol'];
    this.validateRequiredFields(data, requiredFields);

    // Validate and transform the data
    const validatedData: IncomeStatementData = {
      symbol: this.validateStringField(data.symbol, 'symbol', true)!,
      annualReports: this.validateIncomeStatementReports(data.annualReports || [], 'annual'),
      quarterlyReports: this.validateIncomeStatementReports(data.quarterlyReports || [], 'quarterly')
    };

    return validatedData;
  }

  private validateIncomeStatementReports(reports: any[], reportType: string): IncomeStatementReport[] {
    if (!Array.isArray(reports)) {
      console.warn(`${reportType} income statement reports data is not an array, returning empty array`);
      return [];
    }

    return reports.map((report, index) => {
      try {
        return {
          fiscalDateEnding: this.validateDateField(report.fiscalDateEnding, `${reportType}Reports[${index}].fiscalDateEnding`) || '',
          reportedCurrency: this.validateStringField(report.reportedCurrency, `${reportType}Reports[${index}].reportedCurrency`) || 'USD',
          totalRevenue: this.validateStringField(report.totalRevenue, `${reportType}Reports[${index}].totalRevenue`) || '0',
          totalOperatingExpense: this.validateStringField(report.totalOperatingExpense, `${reportType}Reports[${index}].totalOperatingExpense`) || '0',
          costOfRevenue: this.validateStringField(report.costOfRevenue, `${reportType}Reports[${index}].costOfRevenue`) || '0',
          grossProfit: this.validateStringField(report.grossProfit, `${reportType}Reports[${index}].grossProfit`) || '0',
          ebit: this.validateStringField(report.ebit, `${reportType}Reports[${index}].ebit`) || '0',
          netIncome: this.validateStringField(report.netIncome, `${reportType}Reports[${index}].netIncome`) || '0',
          researchAndDevelopment: this.validateStringField(report.researchAndDevelopment, `${reportType}Reports[${index}].researchAndDevelopment`) || '0',
          operatingExpense: this.validateStringField(report.operatingExpense, `${reportType}Reports[${index}].operatingExpense`) || '0',
          investmentIncomeNet: this.validateStringField(report.investmentIncomeNet, `${reportType}Reports[${index}].investmentIncomeNet`) || 'None',
          netInterestIncome: this.validateStringField(report.netInterestIncome, `${reportType}Reports[${index}].netInterestIncome`) || 'None',
          interestIncome: this.validateStringField(report.interestIncome, `${reportType}Reports[${index}].interestIncome`) || 'None',
          interestExpense: this.validateStringField(report.interestExpense, `${reportType}Reports[${index}].interestExpense`) || '0',
          nonInterestIncome: this.validateStringField(report.nonInterestIncome, `${reportType}Reports[${index}].nonInterestIncome`) || 'None',
          otherNonOperatingIncome: this.validateStringField(report.otherNonOperatingIncome, `${reportType}Reports[${index}].otherNonOperatingIncome`) || 'None',
          depreciation: this.validateStringField(report.depreciation, `${reportType}Reports[${index}].depreciation`) || 'None',
          depreciationAndAmortization: this.validateStringField(report.depreciationAndAmortization, `${reportType}Reports[${index}].depreciationAndAmortization`) || 'None',
          incomeBeforeTax: this.validateStringField(report.incomeBeforeTax, `${reportType}Reports[${index}].incomeBeforeTax`) || '0',
          incomeTaxExpense: this.validateStringField(report.incomeTaxExpense, `${reportType}Reports[${index}].incomeTaxExpense`) || '0',
          interestAndDebtExpense: this.validateStringField(report.interestAndDebtExpense, `${reportType}Reports[${index}].interestAndDebtExpense`) || 'None',
          netIncomeFromContinuingOps: this.validateStringField(report.netIncomeFromContinuingOps, `${reportType}Reports[${index}].netIncomeFromContinuingOps`) || '0',
          comprehensiveIncomeNetOfTax: this.validateStringField(report.comprehensiveIncomeNetOfTax, `${reportType}Reports[${index}].comprehensiveIncomeNetOfTax`) || '0',
          ebitda: this.validateStringField(report.ebitda, `${reportType}Reports[${index}].ebitda`) || '0',
          operatingIncome: this.validateStringField(report.operatingIncome, `${reportType}Reports[${index}].operatingIncome`) || '0',
          sellingGeneralAndAdministrative: this.validateStringField(report.sellingGeneralAndAdministrative, `${reportType}Reports[${index}].sellingGeneralAndAdministrative`) || '0',
          otherOperatingExpenses: this.validateStringField(report.otherOperatingExpenses, `${reportType}Reports[${index}].otherOperatingExpenses`) || 'None'
        };
      } catch (error) {
        console.warn(`Error validating ${reportType} income statement report at index ${index}:`, error);
        return {
          fiscalDateEnding: '',
          reportedCurrency: 'USD',
          totalRevenue: '0',
          totalOperatingExpense: '0',
          costOfRevenue: '0',
          grossProfit: '0',
          ebit: '0',
          netIncome: '0',
          researchAndDevelopment: '0',
          operatingExpense: '0',
          investmentIncomeNet: 'None',
          netInterestIncome: 'None',
          interestIncome: 'None',
          interestExpense: '0',
          nonInterestIncome: 'None',
          otherNonOperatingIncome: 'None',
          depreciation: 'None',
          depreciationAndAmortization: 'None',
          incomeBeforeTax: '0',
          incomeTaxExpense: '0',
          interestAndDebtExpense: 'None',
          netIncomeFromContinuingOps: '0',
          comprehensiveIncomeNetOfTax: '0',
          ebitda: '0',
          operatingIncome: '0',
          sellingGeneralAndAdministrative: '0',
          otherOperatingExpenses: 'None'
        };
      }
    }).filter(report => report.fiscalDateEnding !== ''); // Filter out invalid entries
  }

  /**
   * Transform validated data for DynamoDB storage (quarterly reports)
   */
  transformQuarterlyForStorage(validatedData: IncomeStatementData) {
    return validatedData.quarterlyReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      total_revenue: this.validateNumericField(report.totalRevenue, 'totalRevenue'),
      gross_profit: this.validateNumericField(report.grossProfit, 'grossProfit'),
      operating_income: this.validateNumericField(report.operatingIncome, 'operatingIncome'),
      net_income: this.validateNumericField(report.netIncome, 'netIncome'),
      research_and_development: this.validateNumericField(report.researchAndDevelopment, 'researchAndDevelopment'),
      operating_expense: this.validateNumericField(report.operatingExpense, 'operatingExpense'),
      selling_general_and_administrative: this.validateNumericField(report.sellingGeneralAndAdministrative, 'sellingGeneralAndAdministrative'),
      other_operating_expenses: this.validateNumericField(report.otherOperatingExpenses, 'otherOperatingExpenses'),
      interest_expense: this.validateNumericField(report.interestExpense, 'interestExpense'),
      income_before_tax: this.validateNumericField(report.incomeBeforeTax, 'incomeBeforeTax'),
      income_tax_expense: this.validateNumericField(report.incomeTaxExpense, 'incomeTaxExpense'),
      net_income_from_continuing_ops: this.validateNumericField(report.netIncomeFromContinuingOps, 'netIncomeFromContinuingOps'),
      comprehensive_income_net_of_tax: this.validateNumericField(report.comprehensiveIncomeNetOfTax, 'comprehensiveIncomeNetOfTax'),
      ebit: this.validateNumericField(report.ebit, 'ebit'),
      ebitda: this.validateNumericField(report.ebitda, 'ebitda'),
      cost_of_revenue: this.validateNumericField(report.costOfRevenue, 'costOfRevenue'),
      reported_currency: report.reportedCurrency,
      period_type: 'quarterly',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }

  /**
   * Transform validated data for DynamoDB storage (annual reports)
   */
  transformAnnualForStorage(validatedData: IncomeStatementData) {
    return validatedData.annualReports.map(report => ({
      asset_id: validatedData.symbol,
      fiscal_date: report.fiscalDateEnding,
      total_revenue: this.validateNumericField(report.totalRevenue, 'totalRevenue'),
      gross_profit: this.validateNumericField(report.grossProfit, 'grossProfit'),
      operating_income: this.validateNumericField(report.operatingIncome, 'operatingIncome'),
      net_income: this.validateNumericField(report.netIncome, 'netIncome'),
      research_and_development: this.validateNumericField(report.researchAndDevelopment, 'researchAndDevelopment'),
      operating_expense: this.validateNumericField(report.operatingExpense, 'operatingExpense'),
      selling_general_and_administrative: this.validateNumericField(report.sellingGeneralAndAdministrative, 'sellingGeneralAndAdministrative'),
      other_operating_expenses: this.validateNumericField(report.otherOperatingExpenses, 'otherOperatingExpenses'),
      interest_expense: this.validateNumericField(report.interestExpense, 'interestExpense'),
      income_before_tax: this.validateNumericField(report.incomeBeforeTax, 'incomeBeforeTax'),
      income_tax_expense: this.validateNumericField(report.incomeTaxExpense, 'incomeTaxExpense'),
      net_income_from_continuing_ops: this.validateNumericField(report.netIncomeFromContinuingOps, 'netIncomeFromContinuingOps'),
      comprehensive_income_net_of_tax: this.validateNumericField(report.comprehensiveIncomeNetOfTax, 'comprehensiveIncomeNetOfTax'),
      ebit: this.validateNumericField(report.ebit, 'ebit'),
      ebitda: this.validateNumericField(report.ebitda, 'ebitda'),
      cost_of_revenue: this.validateNumericField(report.costOfRevenue, 'costOfRevenue'),
      reported_currency: report.reportedCurrency,
      period_type: 'annual',
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }
} 