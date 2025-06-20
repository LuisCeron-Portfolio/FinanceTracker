import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Transaction, Category, Budget } from '@/types';

export class ExportService {
  // Export transactions to Excel
  static async exportTransactionsToExcel(
    transactions: Transaction[],
    categories: Category[],
    filename?: string
  ): Promise<void> {
    try {
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
      
      // Prepare data for Excel
      const excelData = transactions.map(transaction => ({
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        'Category': categoryMap.get(transaction.category) || 'Unknown',
        'Description': transaction.description,
        'Amount': transaction.amount,
        'Recurring': transaction.isRecurring ? 'Yes' : 'No',
        'Recurring Period': transaction.recurringPeriod || 'N/A',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Add summary sheet
      const summary = this.generateSummaryData(transactions, categories);
      const summaryWorksheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx'
      });

      // Save to device
      const fileName = filename || `financial_data_${new Date().getTime()}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Financial Data',
        });
      }

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export data to Excel');
    }
  }

  // Generate summary data for Excel export
  private static generateSummaryData(transactions: Transaction[], categories: Category[]) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate monthly totals
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // Calculate spending by category
    const categorySpending = new Map<string, number>();
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = categoryMap.get(t.category) || 'Unknown';
        categorySpending.set(categoryName, (categorySpending.get(categoryName) || 0) + t.amount);
      });

    const summaryData = [
      { 'Metric': 'Monthly Income', 'Value': monthlyIncome },
      { 'Metric': 'Monthly Expenses', 'Value': monthlyExpenses },
      { 'Metric': 'Monthly Balance', 'Value': monthlyBalance },
      { 'Metric': 'Total Transactions', 'Value': transactions.length },
      { 'Metric': 'Export Date', 'Value': currentDate.toLocaleDateString() },
      { 'Metric': '', 'Value': '' }, // Empty row
      { 'Metric': 'SPENDING BY CATEGORY', 'Value': '' },
    ];

    // Add category spending to summary
    Array.from(categorySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        summaryData.push({ 'Metric': category, 'Value': amount });
      });

    return summaryData;
  }

  // Export budgets to Excel
  static async exportBudgetsToExcel(
    budgets: Budget[],
    categories: Category[],
    transactions: Transaction[],
    filename?: string
  ): Promise<void> {
    try {
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
      
      const budgetData = budgets.map(budget => {
        const spent = transactions
          .filter(t => t.category === budget.categoryId && 
                      t.type === 'expense' &&
                      new Date(t.date) >= new Date(budget.startDate) &&
                      new Date(t.date) <= new Date(budget.endDate))
          .reduce((sum, t) => sum + t.amount, 0);

        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;

        return {
          'Category': categoryMap.get(budget.categoryId) || 'Unknown',
          'Budget Amount': budget.amount,
          'Amount Spent': spent,
          'Remaining': remaining,
          'Percentage Used': `${percentage.toFixed(1)}%`,
          'Period': budget.period,
          'Start Date': new Date(budget.startDate).toLocaleDateString(),
          'End Date': new Date(budget.endDate).toLocaleDateString(),
          'Alert Threshold': `${budget.alertThreshold}%`,
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Budgets');

      const excelBuffer = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx'
      });

      const fileName = filename || `budget_report_${new Date().getTime()}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Budget Report',
        });
      }

    } catch (error) {
      console.error('Error exporting budgets to Excel:', error);
      throw new Error('Failed to export budget data to Excel');
    }
  }

  // Future-proof method for other export formats
  static async exportData(
    data: any,
    format: 'excel' | 'csv' | 'json' | 'pdf',
    filename?: string
  ): Promise<void> {
    switch (format) {
      case 'excel':
        // Already implemented above
        break;
      case 'csv':
        // TODO: Implement CSV export
        throw new Error('CSV export not yet implemented');
      case 'json':
        // TODO: Implement JSON export
        throw new Error('JSON export not yet implemented');
      case 'pdf':
        // TODO: Implement PDF export
        throw new Error('PDF export not yet implemented');
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}