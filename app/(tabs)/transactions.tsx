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
  Search, 
  Filter, 
  Download,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react-native';

import { StorageService } from '@/utils/storage';
import { ExportService } from '@/utils/export';
import { Transaction, Category } from '@/types';
import TransactionCard from '@/components/TransactionCard';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringPeriod: 'monthly' as 'daily' | 'weekly' | 'monthly',
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        StorageService.getTransactions(),
        StorageService.getCategories(),
      ]);
      
      setTransactions(transactionsData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      setCategories(categoriesData);
      
      // Set default category if not set
      if (!formData.category && categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categories.find(cat => cat.id === transaction.category)?.name
          .toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.category === selectedCategory
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === selectedType
      );
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: categories.length > 0 ? categories[0].id : '',
      description: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurringPeriod: 'monthly',
    });
  };

  const handleAddTransaction = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      RNAlert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const transaction: Transaction = {
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringPeriod: formData.isRecurring ? formData.recurringPeriod : undefined,
      };

      await StorageService.addTransaction(transaction);
      await loadData();
      setIsAddModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error adding transaction:', error);
      RNAlert.alert('Error', 'Failed to add transaction');
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction || !formData.amount || !formData.description || !formData.category) {
      RNAlert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringPeriod: formData.isRecurring ? formData.recurringPeriod : undefined,
      };

      await StorageService.updateTransaction(updatedTransaction);
      await loadData();
      setEditingTransaction(null);
      setIsAddModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error updating transaction:', error);
      RNAlert.alert('Error', 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    RNAlert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteTransaction(id);
              await loadData();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              RNAlert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      isRecurring: transaction.isRecurring || false,
      recurringPeriod: transaction.recurringPeriod || 'monthly',
    });
    setIsAddModalVisible(true);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    resetForm();
    setIsAddModalVisible(true);
  };

  const handleExport = async () => {
    try {
      await ExportService.exportTransactionsToExcel(transactions, categories);
      RNAlert.alert('Success', 'Transactions exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      RNAlert.alert('Error', 'Failed to export transactions');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setIsFilterModalVisible(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Download size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setIsFilterModalVisible(true)}>
            <Filter size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Transaction List */}
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
        <View style={styles.transactionsList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                category={categories.find(cat => cat.id === transaction.category)}
                onEdit={() => openEditModal(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first transaction to get started'
                }
              </Text>
            </View>
          )}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add/Edit Transaction Modal */}
      <Modal
        isVisible={isAddModalVisible}
        onBackdropPress={() => setIsAddModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'expense' && styles.typeButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'expense' && styles.typeButtonTextActive
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'income' && styles.typeButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'income' && styles.typeButtonTextActive
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount *</Text>
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
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Tag size={20} color="#64748B" style={styles.inputIcon} />
              <Picker
                selectedValue={formData.category}
                style={styles.picker}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                dropdownIconColor="#64748B"
              >
                {categories.map(category => (
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
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              placeholderTextColor="#64748B"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
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
              onPress={editingTransaction ? handleEditTransaction : handleAddTransaction}
            >
              <Text style={styles.saveButtonText}>
                {editingTransaction ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isVisible={isFilterModalVisible}
        onBackdropPress={() => setIsFilterModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Transactions</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                style={styles.picker}
                onValueChange={setSelectedCategory}
                dropdownIconColor="#64748B"
              >
                <Picker.Item label="All Categories" value="all" color="#F1F5F9" />
                {categories.map(category => (
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
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedType}
                style={styles.picker}
                onValueChange={setSelectedType}
                dropdownIconColor="#64748B"
              >
                <Picker.Item label="All Types" value="all" color="#F1F5F9" />
                <Picker.Item label="Income" value="income" color="#F1F5F9" />
                <Picker.Item label="Expense" value="expense" color="#F1F5F9" />
              </Picker>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={clearFilters}>
              <Text style={styles.cancelButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Apply</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#F1F5F9',
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  picker: {
    flex: 1,
    color: '#F1F5F9',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  typeButtonTextActive: {
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