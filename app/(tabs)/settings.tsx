import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  TextInput,
  Alert as RNAlert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { 
  User, 
  Bell, 
  Palette, 
  Download, 
  Trash2, 
  Plus,
  Tag,
  DollarSign,
  Globe,
  Shield,
  Info
} from 'lucide-react-native';

import { StorageService } from '@/utils/storage';
import { ExportService } from '@/utils/export';
import { UserSettings, Category, Transaction } from '@/types';
import { DEFAULT_CATEGORIES, CHART_COLORS } from '@/constants/categories';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: CHART_COLORS[0],
    icon: 'tag',
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [settingsData, categoriesData, transactionsData] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getCategories(),
        StorageService.getTransactions(),
      ]);
      
      setSettings(settingsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      setMonthlyIncome(settingsData.monthlyIncome.toString());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await StorageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      RNAlert.alert('Error', 'Failed to update settings');
    }
  };

  const handleIncomeUpdate = async () => {
    if (!settings) return;
    
    const income = parseFloat(monthlyIncome) || 0;
    await updateSettings({ monthlyIncome: income });
    setIsIncomeModalVisible(false);
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      RNAlert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryForm.name.trim(),
        color: categoryForm.color,
        icon: categoryForm.icon,
        isCustom: true,
      };

      await StorageService.addCategory(newCategory);
      await loadData();
      setIsCategoryModalVisible(false);
      setCategoryForm({ name: '', color: CHART_COLORS[0], icon: 'tag' });
    } catch (error) {
      console.error('Error adding category:', error);
      RNAlert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !category.isCustom) {
      RNAlert.alert('Error', 'Cannot delete default categories');
      return;
    }

    RNAlert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteCategory(categoryId);
              await loadData();
            } catch (error) {
              console.error('Error deleting category:', error);
              RNAlert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async (format: 'transactions' | 'budgets' | 'all') => {
    try {
      switch (format) {
        case 'transactions':
          await ExportService.exportTransactionsToExcel(transactions, categories);
          break;
        case 'budgets':
          const budgets = await StorageService.getBudgets();
          await ExportService.exportBudgetsToExcel(budgets, categories, transactions);
          break;
        case 'all':
          await ExportService.exportTransactionsToExcel(transactions, categories);
          break;
      }
      setIsExportModalVisible(false);
      RNAlert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      RNAlert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearAllData = () => {
    RNAlert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, budgets, and custom categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadData();
              RNAlert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              RNAlert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setIsIncomeModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <DollarSign size={20} color="#94A3B8" />
              <Text style={styles.settingText}>Monthly Income</Text>
            </View>
            <Text style={styles.settingValue}>
              ${settings.monthlyIncome.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>Budget Alerts</Text>
              <Text style={styles.settingSubtext}>
                Get notified when approaching budget limits
              </Text>
            </View>
            <Switch
              value={settings.notifications.budgetAlerts}
              onValueChange={(value) => 
                updateSettings({ 
                  notifications: { ...settings.notifications, budgetAlerts: value } 
                })
              }
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>Spending Alerts</Text>
              <Text style={styles.settingSubtext}>
                Get notified about unusual spending patterns
              </Text>
            </View>
            <Switch
              value={settings.notifications.spendingAlerts}
              onValueChange={(value) => 
                updateSettings({ 
                  notifications: { ...settings.notifications, spendingAlerts: value } 
                })
              }
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>Reminder Alerts</Text>
              <Text style={styles.settingSubtext}>
                Get reminded to log transactions
              </Text>
            </View>
            <Switch
              value={settings.notifications.reminderAlerts}
              onValueChange={(value) => 
                updateSettings({ 
                  notifications: { ...settings.notifications, reminderAlerts: value } 
                })
              }
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesList}>
            {categories.filter(cat => cat.isCustom).map(category => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View 
                    style={[
                      styles.categoryColor, 
                      { backgroundColor: category.color }
                    ]} 
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDeleteCategory(category.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {categories.filter(cat => cat.isCustom).length === 0 && (
              <Text style={styles.noCategoriesText}>
                No custom categories yet. Tap + to add one.
              </Text>
            )}
          </View>
        </View>

        {/* Data & Export Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Download size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>Data & Export</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setIsExportModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Download size={20} color="#94A3B8" />
              <Text style={styles.settingText}>Export Data</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleClearAllData}
          >
            <View style={styles.settingLeft}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.settingText, styles.dangerText]}>
                Clear All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#64748B" />
            <Text style={styles.sectionTitle}>App Info</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Storage</Text>
            <Text style={styles.settingValue}>Local Device</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Monthly Income Modal */}
      <Modal
        isVisible={isIncomeModalVisible}
        onBackdropPress={() => setIsIncomeModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Monthly Income</Text>
          <Text style={styles.modalSubtitle}>
            This helps calculate your savings rate and spending alerts
          </Text>
          
          <View style={styles.inputContainer}>
            <DollarSign size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsIncomeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleIncomeUpdate}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isVisible={isCategoryModalVisible}
        onBackdropPress={() => setIsCategoryModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Custom Category</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              placeholderTextColor="#64748B"
              value={categoryForm.name}
              onChangeText={(text) => setCategoryForm(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorPicker}>
              {CHART_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    categoryForm.color === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setCategoryForm(prev => ({ ...prev, color }))}
                />
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        isVisible={isExportModalVisible}
        onBackdropPress={() => setIsExportModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Export Data</Text>
          <Text style={styles.modalSubtitle}>
            Choose what data to export as Excel file
          </Text>
          
          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('transactions')}
          >
            <Text style={styles.exportOptionText}>Export Transactions</Text>
            <Text style={styles.exportOptionSubtext}>
              All transaction data with categories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportOption}
            onPress={() => handleExportData('budgets')}
          >
            <Text style={styles.exportOptionText}>Export Budget Report</Text>
            <Text style={styles.exportOptionSubtext}>
              Budget progress and spending analysis
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsExportModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 6,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F1F5F9',
    marginLeft: 12,
  },
  settingSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 20,
    color: '#64748B',
  },
  dangerItem: {
    borderColor: '#7F1D1D',
  },
  dangerText: {
    color: '#EF4444',
  },
  categoriesList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#F1F5F9',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  noCategoriesText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#475569',
    marginBottom: 20,
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#F1F5F9',
  },
  exportOption: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  exportOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  exportOptionSubtext: {
    fontSize: 14,
    color: '#94A3B8',
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