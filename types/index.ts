export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom: boolean;
  budgetLimit?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number; // percentage (0-100)
}

export interface Alert {
  id: string;
  type: 'budget_limit' | 'high_spending' | 'frequent_transactions';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface UserSettings {
  currency: string;
  language: 'en' | 'es';
  theme: 'light' | 'dark';
  notifications: {
    budgetAlerts: boolean;
    spendingAlerts: boolean;
    reminderAlerts: boolean;
  };
  monthlyIncome: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: string[];
  }[];
}