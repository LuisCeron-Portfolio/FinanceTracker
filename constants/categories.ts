import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: '1', name: 'Salary', color: '#10B981', icon: 'briefcase', isCustom: false },
  { id: '2', name: 'Freelance', color: '#8B5CF6', icon: 'laptop', isCustom: false },
  { id: '3', name: 'Investment', color: '#F59E0B', icon: 'trending-up', isCustom: false },
  
  // Expense categories
  { id: '4', name: 'Food & Dining', color: '#EF4444', icon: 'utensils', isCustom: false },
  { id: '5', name: 'Transportation', color: '#3B82F6', icon: 'car', isCustom: false },
  { id: '6', name: 'Shopping', color: '#EC4899', icon: 'shopping-bag', isCustom: false },
  { id: '7', name: 'Entertainment', color: '#F97316', icon: 'game-controller-01', isCustom: false },
  { id: '8', name: 'Bills & Utilities', color: '#6366F1', icon: 'zap', isCustom: false },
  { id: '9', name: 'Healthcare', color: '#EF4444', icon: 'heart', isCustom: false },
  { id: '10', name: 'Education', color: '#10B981', icon: 'graduation-cap', isCustom: false },
  { id: '11', name: 'Travel', color: '#06B6D4', icon: 'plane', isCustom: false },
  { id: '12', name: 'Home & Garden', color: '#84CC16', icon: 'home', isCustom: false },
  { id: '13', name: 'Insurance', color: '#64748B', icon: 'shield', isCustom: false },
  { id: '14', name: 'Gifts & Donations', color: '#DB2777', icon: 'gift', isCustom: false },
  { id: '15', name: 'Personal Care', color: '#A855F7', icon: 'user', isCustom: false },
];

export const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#F97316', '#6366F1', '#06B6D4', '#84CC16',
  '#64748B', '#DB2777', '#A855F7', '#FB7185', '#FBBF24'
];