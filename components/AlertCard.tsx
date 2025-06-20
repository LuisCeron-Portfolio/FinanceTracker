import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from '@/types';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react-native';

interface AlertCardProps {
  alert: Alert;
  onDismiss?: () => void;
  onPress?: () => void;
}

export default function AlertCard({ alert, onDismiss, onPress }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.severity) {
      case 'high':
        return <AlertTriangle size={20} color="#EF4444" />;
      case 'medium':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'low':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Info size={20} color="#64748B" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#3B82F6';
      default:
        return '#64748B';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderLeftColor: getAlertColor() },
        alert.isRead && styles.readAlert
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getAlertIcon()}
          </View>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.title,
              alert.isRead && styles.readText
            ]}>
              {alert.title}
            </Text>
            <Text style={styles.date}>
              {formatDate(alert.date)}
            </Text>
          </View>
          {onDismiss && (
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[
          styles.message,
          alert.isRead && styles.readText
        ]}>
          {alert.message}
        </Text>
        
        {!alert.isRead && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  readAlert: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginLeft: 32,
  },
  readText: {
    color: '#64748B',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
});