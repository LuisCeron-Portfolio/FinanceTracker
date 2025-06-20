import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget, Alert, UserSettings } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

const STORAGE_KEYS = {
  TRANSACTIONS: '@finance_app_transactions',
  CATEGORIES: '@finance_app_categories',
  BUDGETS: '@finance_app_budgets',
  ALERTS: '@finance_app_alerts',
  SETTINGS: '@finance_app_settings',
  FIRST_LAUNCH: '@finance_app_first_launch',
};

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  language: 'en',
  theme: 'dark',
  notifications: {
    budgetAlerts: true,
    spendingAlerts: true,
    reminderAlerts: true,
  },
  monthlyIncome: 0,
};

export class StorageService {
  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  static async addTransaction(transaction: Transaction): Promise<void> {
    const transactions = await this.getTransactions();
    transactions.push(transaction);
    await this.saveTransactions(transactions);
  }

  static async updateTransaction(updatedTransaction: Transaction): Promise<void> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      await this.saveTransactions(transactions);
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await this.saveTransactions(filtered);
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        // First time, initialize with default categories
        await this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  static async addCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  }

  static async updateCategory(updatedCategory: Category): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      categories[index] = updatedCategory;
      await this.saveCategories(categories);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id || !c.isCustom);
    await this.saveCategories(filtered);
  }

  // Budgets
  static async getBudgets(): Promise<Budget[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  }

  static async saveBudgets(budgets: Budget[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  }

  static async addBudget(budget: Budget): Promise<void> {
    const budgets = await this.getBudgets();
    budgets.push(budget);
    await this.saveBudgets(budgets);
  }

  static async updateBudget(updatedBudget: Budget): Promise<void> {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === updatedBudget.id);
    if (index !== -1) {
      budgets[index] = updatedBudget;
      await this.saveBudgets(budgets);
    }
  }

  static async deleteBudget(id: string): Promise<void> {
    const budgets = await this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    await this.saveBudgets(filtered);
  }

  // Alerts
  static async getAlerts(): Promise<Alert[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  static async saveAlerts(alerts: Alert[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  static async addAlert(alert: Alert): Promise<void> {
    const alerts = await this.getAlerts();
    alerts.unshift(alert); // Add to beginning
    await this.saveAlerts(alerts);
  }

  static async markAlertAsRead(id: string): Promise<void> {
    const alerts = await this.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].isRead = true;
      await this.saveAlerts(alerts);
    }
  }

  static async clearAlerts(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
  }

  // Settings
  static async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        await this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // First launch check
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }

  // Clear all data (for testing or reset)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}