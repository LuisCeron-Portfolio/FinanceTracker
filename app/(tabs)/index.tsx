import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bell,
  Eye,
  EyeOff 
} from 'lucide-react-native';

import { StorageService } from '@/utils/storage';
import { FinanceCalculations } from '@/utils/calculations';
import { Transaction, Category, Budget, Alert } from '@/types';
import ChartCard from '@/components/ChartCard';
import AlertCard from '@/components/AlertCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  });
  const [showBalance, setShowBalance] = useState(true);
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any>({ labels: [], datasets: [{ data: [] }] });

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const [
        transactionsData,
        categoriesData,
        budgetsData,
        alertsData,
        settings,
      ] = await Promise.all([
        StorageService.getTransactions(),
        StorageService.getCategories(),
        StorageService.getBudgets(),
        StorageService.getAlerts(),
        StorageService.getSettings(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
      setAlerts(alertsData.filter(alert => !alert.isRead).slice(0, 3)); // Show only first 3 unread alerts

      // Calculate monthly data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyTotals = FinanceCalculations.calculateMonthlyTotals(
        transactionsData,
        currentYear,
        currentMonth
      );
      
      const savingsRate = FinanceCalculations.calculateSavingsRate(
        monthlyTotals.income,
        monthlyTotals.expenses
      );

      setMonthlyData({
        ...monthlyTotals,
        savingsRate,
      });

      // Calculate spending by category for pie chart
      const categorySpending = FinanceCalculations.calculateSpendingByCategory(
        transactionsData,
        categoriesData,
        new Date(currentYear, currentMonth, 1),
        new Date(currentYear, currentMonth + 1, 0)
      );

      // Format for pie chart
      const pieChartData = categorySpending
        .slice(0, 6) // Show top 6 categories
        .map(item => ({
          name: item.category,
          amount: item.amount,
          color: item.color,
          legendFontColor: '#94A3B8',
          legendFontSize: 12,
        }));

      setSpendingByCategory(pieChartData);

      // Generate trend data for line chart
      const trendChart = FinanceCalculations.generateSpendingTrendData(transactionsData, 6);
      setTrendData({
        labels: trendChart.labels,
        datasets: [{ data: trendChart.data }],
      });

      // Check for new alerts
      const newAlerts = await FinanceCalculations.checkSpendingAlerts(
        transactionsData,
        categoriesData,
        budgetsData,
        settings.monthlyIncome
      );

      // Add new alerts to storage
      for (const alertMessage of newAlerts) {
        const alert: Alert = {
          id: Date.now().toString() + Math.random(),
          type: 'high_spending',
          title: 'Spending Alert',
          message: alertMessage,
          date: new Date().toISOString(),
          isRead: false,
          severity: 'medium',
        };
        await StorageService.addAlert(alert);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const handleAlertDismiss = async (alertId: string) => {
    await StorageService.markAlertAsRead(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const formatCurrency = (amount: number) => {
    return showBalance ? `$${amount.toFixed(2)}` : '••••••';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}</Text>
            <Text style={styles.subtitle}>Here's your financial overview</Text>
          </View>
          <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.eyeButton}>
            {showBalance ? (
              <Eye size={24} color="#94A3B8" />
            ) : (
              <EyeOff size={24} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>

        {/* Monthly Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Income</Text>
            </View>
            <Text style={styles.cardAmount}>
              {formatCurrency(monthlyData.income)}
            </Text>
            <Text style={styles.cardSubtext}>This month</Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <TrendingDown size={20} color="#EF4444" />
              <Text style={styles.cardTitle}>Expenses</Text>
            </View>
            <Text style={styles.cardAmount}>
              {formatCurrency(monthlyData.expenses)}
            </Text>
            <Text style={styles.cardSubtext}>This month</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <DollarSign size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Net Balance</Text>
          </View>
          <Text style={[
            styles.balanceAmount,
            { color: monthlyData.balance >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {formatCurrency(monthlyData.balance)}
          </Text>
          <Text style={styles.cardSubtext}>
            Savings Rate: {showBalance ? `${monthlyData.savingsRate.toFixed(1)}%` : '••••'}
          </Text>
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
            </View>
            {alerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={() => handleAlertDismiss(alert.id)}
              />
            ))}
          </View>
        )}

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          
          {/* Spending by Category */}
          {spendingByCategory.length > 0 && (
            <ChartCard
              title="Spending by Category"
              type="pie"
              data={spendingByCategory}
              height={220}
            />
          )}

          {/* Spending Trend */}
          {trendData.datasets[0].data.length > 0 && (
            <ChartCard
              title="6-Month Spending Trend"
              type="line"
              data={trendData}
              height={200}
            />
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Total Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{budgets.length}</Text>
              <Text style={styles.statLabel}>Active Budgets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{categories.filter(c => c.isCustom).length}</Text>
              <Text style={styles.statLabel}>Custom Categories</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  eyeButton: {
    padding: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1F5F9',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});