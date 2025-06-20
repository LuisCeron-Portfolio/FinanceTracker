import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert as RNAlert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { 
  Plus, 
  Target, 
  TrendingUp,
  Download,
  DollarSign,
  Calendar,
  Percent
} from 'lucide-react-native';

import { StorageService } from '@/utils/storage';
import { FinanceCalculations } from '@/utils/calculations';
import { ExportService } from '@/utils/export';
import { Budget, Category, Transaction } from '@/types';
import BudgetCard from '@/components/BudgetCard';

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Summary stats
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    activeBudgets: 0,
    budgetsOverLimit: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly',
    alertThreshold: '80',
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        StorageService.getBudgets(),
        StorageService.getCategories(),
        StorageService.getTransactions(),
      ]);
      
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      
      // Calculate budget summary
      calculateBudgetSummary(budgetsData, transactionsData);
      
      // Set default category if not set
      if (!formData.categoryId && categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateBudgetSummary = (budgetsData: Budget[], transactionsData: Transaction[]) => {
    let totalBudget = 0;
    let totalSpent = 0;
    let budgetsOverLimit = 0;

    budgetsData.forEach(budget => {
      totalBudget += budget.amount;
      const spent = FinanceCalculations.calculateBudgetProgress(budget, transactionsData);
      totalSpent += spent;
      
      const percentage = (spent / budget.amount) * 100;
      if (percentage >= budget.alertThreshold) {
        budgetsOverLimit++;
      }
    });

    setBudgetSummary({
      totalBudget,
      totalSpent,
      activeBudgets: budgetsData.length,
      budgetsOverLimit,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : '',
      amount: '',
      period: 'monthly',
      alertThreshold: '80',
    });
  };

  const generateBudgetDates = (period: 'monthly' | 'yearly') => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleAddBudget = async () => {
    if (!formData.categoryId || !formData.amount) {
      RNAlert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => 
      b.categoryId === formData.categoryId && 
      b.period === formData.period
    );

    if (existingBudget && !editingBudget) {
      RNAlert.alert('Error', 'A budget already exists for this category and period');
      return;
    }

    try {
      const { startDate, endDate } = generateBudgetDates(formData.period);
      
      const budget: Budget = {
        id: editingBudget?.id || Date.now().toString(),
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        spent: 0,
        period: formData.period,
        startDate,
        endDate,
        alertThreshold: parseInt(formData.alertThreshold),
      };

      if (editingBudget) {
        await StorageService.updateBudget(budget);
      } else {
        await StorageService.addBudget(budget);
      }

      await loadData();
      setIsAddModalVisible(false);
      setEditingBudget(null);
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
      RNAlert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    RNAlert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteBudget(id);
              await loadData();
            } catch (error) {
              console.error('Error deleting budget:', error);
              RNAlert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold.toString(),
    });
    setIsAddModalVisible(true);
  };

  const openAddModal = () => {
    setEditingBudget(null);
    resetForm();
    setIsAddModalVisible(true);
  };

  const handleExport = async () => {
    try {
      await ExportService.exportBudgetsToExcel(budgets, categories, transactions);
      RNAlert.alert('Success', 'Budget report exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      RNAlert.alert('Error', 'Failed to export budget report');
    }
  };

  const getAvailableCategories = () => {
    const usedCategoryIds = budgets
      .filter(b => b.id !== editingBudget?.id)
      .map(b => b.categoryId);
    
    return categories.filter(cat => !usedCategoryIds.includes(cat.id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Download size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

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
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.totalBudgetCard]}>
            <View style={styles.cardHeader}>
              <Target size={18} color="#3B82F6" />
              <Text style={styles.cardTitle}>Total Budget</Text>
            </View>
            <Text style={styles.cardAmount}>
              ${budgetSummary.totalBudget.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.spentCard]}>
            <View style={styles.cardHeader}>
              <TrendingUp size={18} color="#EF4444" />
              <Text style={styles.cardTitle}>Total Spent</Text>
            </View>
            <Text style={styles.cardAmount}>
              ${budgetSummary.totalSpent.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.activeBudgetsCard]}>
            <Text style={styles.cardAmount}>{budgetSummary.activeBudgets}</Text>
            <Text style={styles.cardTitle}>Active Budgets</Text>
          </View>

          <View style={[styles.summaryCard, styles.alertsCard]}>
            <Text style={[
              styles.cardAmount,
              { color: budgetSummary.budgetsOverLimit > 0 ? '#EF4444' : '#10B981' }
            ]}>
              {budgetSummary.budgetsOverLimit}
            </Text>
            <Text style={styles.cardTitle}>Over Threshold</Text>
          </View>
        </View>

        {/* Budget List */}
        <View style={styles.budgetsList}>
          {budgets.length > 0 ? (
            budgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                category={categories.find(cat => cat.id === budget.categoryId)}
                spent={FinanceCalculations.calculateBudgetProgress(budget, transactions)}
                onEdit={() => openEditModal(budget)}
                onDelete={() => handleDeleteBudget(budget.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color="#64748B" />
              <Text style={styles.emptyStateText}>No budgets yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first budget to start tracking your spending
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add/Edit Budget Modal */}
      <Modal
        isVisible={isAddModalVisible}
        onBackdropPress={() => setIsAddModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoryId}
                style={styles.picker}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                dropdownIconColor="#64748B"
              >
                {getAvailableCategories().map(category => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                    color="#F1F5F9"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Budget Amount *</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                value={formData.amount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Period</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  formData.period === 'monthly' && styles.periodButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, period: 'monthly' }))}
              >
                <Text style={[
                  styles.periodButtonText,
                  formData.period === 'monthly' && styles.periodButtonTextActive
                ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  formData.period === 'yearly' && styles.periodButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, period: 'yearly' }))}
              >
                <Text style={[
                  styles.periodButtonText,
                  formData.period === 'yearly' && styles.periodButtonTextActive
                ]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Alert Threshold (%)</Text>
            <View style={styles.inputContainer}>
              <Percent size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="80"
                placeholderTextColor="#64748B"
                value={formData.alertThreshold}
                onChangeText={(text) => setFormData(prev => ({ ...prev, alertThreshold: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsAddModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveButtonText}>
                {editingBudget ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
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
  totalBudgetCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  spentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  activeBudgetsCard: {
    alignItems: 'center',
  },
  alertsCard: {
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 6,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  budgetsList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomSpacing: {
    height: 20,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#F1F5F9',
    paddingVertical: 12,
  },
  pickerContainer: {
    backgroundColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  picker: {
    color: '#F1F5F9',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});