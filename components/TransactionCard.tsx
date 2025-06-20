import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction, Category } from '@/types';
import { Trash2, Edit3 } from 'lucide-react-native';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TransactionCard({ 
  transaction, 
  category, 
  onEdit, 
  onDelete 
}: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#10B981' : '#EF4444';
  const date = new Date(transaction.date).toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View 
          style={[
            styles.categoryIndicator, 
            { backgroundColor: category?.color || '#64748B' }
          ]} 
        />
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.category}>
            {category?.name || 'Unknown Category'}
          </Text>
          <Text style={styles.date}>{date}</Text>
          {transaction.isRecurring && (
            <Text style={styles.recurring}>
              Recurring • {transaction.recurringPeriod}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
        </Text>
        
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Edit3 size={16} color="#64748B" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  recurring: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});