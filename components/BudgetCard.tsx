import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Budget, Category } from '@/types';
import * as Progress from 'react-native-progress';
import { AlertTriangle, Edit3, Trash2 } from 'lucide-react-native';

interface BudgetCardProps {
  budget: Budget;
  category?: Category;
  spent: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function BudgetCard({ 
  budget, 
  category, 
  spent, 
  onEdit, 
  onDelete 
}: BudgetCardProps) {
  const remaining = budget.amount - spent;
  const percentage = Math.min((spent / budget.amount) * 100, 100);
  const isOverBudget = spent > budget.amount;
  const isNearLimit = percentage >= budget.alertThreshold;

  const getProgressColor = () => {
    if (isOverBudget) return '#EF4444';
    if (isNearLimit) return '#F59E0B';
    return '#10B981';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.categoryName}>
            {category?.name || 'Unknown Category'}
          </Text>
          <Text style={styles.period}>
            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
          </Text>
        </View>
        
        {(isOverBudget || isNearLimit) && (
          <View style={styles.warningContainer}>
            <AlertTriangle 
              size={20} 
              color={isOverBudget ? '#EF4444' : '#F59E0B'} 
            />
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.spentText}>
            ${spent.toFixed(2)} spent
          </Text>
          <Text style={styles.budgetText}>
            of ${budget.amount.toFixed(2)}
          </Text>
        </View>
        
        <Progress.Bar
          progress={Math.min(percentage / 100, 1)}
          width={null}
          height={8}
          color={getProgressColor()}
          unfilledColor="#334155"
          borderColor="transparent"
          style={styles.progressBar}
        />
        
        <View style={styles.progressFooter}>
          <Text style={[
            styles.remainingText,
            { color: isOverBudget ? '#EF4444' : '#10B981' }
          ]}>
            {isOverBudget 
              ? `$${Math.abs(remaining).toFixed(2)} over budget`
              : `$${remaining.toFixed(2)} remaining`
            }
          </Text>
          <Text style={styles.percentageText}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.alertThreshold}>
          Alert at {budget.alertThreshold}%
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
    color: '#94A3B8',
  },
  warningContainer: {
    marginLeft: 12,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  budgetText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  progressBar: {
    marginBottom: 8,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertThreshold: {
    fontSize: 12,
    color: '#64748B',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});