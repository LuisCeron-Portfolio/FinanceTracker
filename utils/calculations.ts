import { Transaction, Budget, Category } from '@/types';
import { StorageService } from './storage';

export class FinanceCalculations {
  // Calculate total for a specific time period
  static calculateTotalByPeriod(
    transactions: Transaction[],
    type: 'income' | 'expense' | 'all',
    startDate: Date,
    endDate: Date
  ): number {
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const matchesType = type === 'all' || transaction.type === type;
        const withinPeriod = transactionDate >= startDate && transactionDate <= endDate;
        return matchesType && withinPeriod;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  // Calculate monthly totals
  static calculateMonthlyTotals(transactions: Transaction[], year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const income = this.calculateTotalByPeriod(transactions, 'income', startDate, endDate);
    const expenses = this.calculateTotalByPeriod(transactions, 'expense', startDate, endDate);
    const balance = income - expenses;

    return { income, expenses, balance };
  }

  // Calculate spending by category
  static calculateSpendingByCategory(
    transactions: Transaction[],
    categories: Category[],
    startDate?: Date,
    endDate?: Date
  ) {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const spending = new Map<string, number>();

    transactions
      .filter(transaction => {
        if (transaction.type !== 'expense') return false;
        if (startDate && endDate) {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        }
        return true;
      })
      .forEach(transaction => {
        const current = spending.get(transaction.category) || 0;
        spending.set(transaction.category, current + transaction.amount);
      });

    return Array.from(spending.entries())
      .map(([categoryId, amount]) => ({
        category: categoryMap.get(categoryId)?.name || 'Unknown',
        amount,
        color: categoryMap.get(categoryId)?.color || '#64748B',
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  // Calculate budget progress
  static calculateBudgetProgress(budget: Budget, transactions: Transaction[]): number {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    
    const spent = this.calculateTotalByPeriod(
      transactions.filter(t => t.category === budget.categoryId),
      'expense',
      startDate,
      endDate
    );

    return spent;
  }

  // Check for spending alerts
  static async checkSpendingAlerts(
    transactions: Transaction[],
    categories: Category[],
    budgets: Budget[],
    monthlyIncome: number
  ): Promise<string[]> {
    const alerts: string[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Check for high spending percentage of income
    const monthlyExpenses = this.calculateTotalByPeriod(
      transactions,
      'expense',
      new Date(currentYear, currentMonth, 1),
      new Date(currentYear, currentMonth + 1, 0)
    );

    if (monthlyIncome > 0) {
      const spendingPercentage = (monthlyExpenses / monthlyIncome) * 100;
      if (spendingPercentage > 80) {
        alerts.push(`High spending alert: You've spent ${spendingPercentage.toFixed(1)}% of your monthly income`);
      }
    }

    // Check for frequent transactions (more than 10 in a day)
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date.startsWith(today));
    if (todayTransactions.length > 10) {
      alerts.push(`Frequent transactions alert: ${todayTransactions.length} transactions today`);
    }

    // Check budget limits
    for (const budget of budgets) {
      const spent = this.calculateBudgetProgress(budget, transactions);
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage >= budget.alertThreshold) {
        const category = categories.find(c => c.id === budget.categoryId);
        alerts.push(`Budget alert: ${percentage.toFixed(1)}% spent on ${category?.name || 'Unknown category'}`);
      }
    }

    return alerts;
  }

  // Generate chart data for spending trends
  static generateSpendingTrendData(transactions: Transaction[], months: number = 6) {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      const monthExpenses = this.calculateMonthlyTotals(
        transactions,
        date.getFullYear(),
        date.getMonth()
      ).expenses;

      labels.push(monthName);
      data.push(monthExpenses);
    }

    return { labels, data };
  }

  // Calculate savings rate
  static calculateSavingsRate(income: number, expenses: number): number {
    if (income <= 0) return 0;
    return ((income - expenses) / income) * 100;
  }

  // Get top spending categories
  static getTopSpendingCategories(
    transactions: Transaction[],
    categories: Category[],
    limit: number = 5
  ) {
    const spending = this.calculateSpendingByCategory(transactions, categories);
    return spending.slice(0, limit);
  }
}