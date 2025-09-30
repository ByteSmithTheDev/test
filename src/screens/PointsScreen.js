import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

export default function PointsScreen() {
  const [points, setPoints] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      const response = await apiService.getPointsBalance();
      setPoints(response.points || 0);
      setLedger(response.last50 || []);
    } catch (error) {
      console.error('Failed to load points:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPointsData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderLedgerItem = (item) => (
    <View key={item._id} style={styles.ledgerItem}>
      <View style={styles.ledgerLeft}>
        <Ionicons
          name={item.type === 'EARN' ? 'add-circle' : 'remove-circle'}
          size={24}
          color={item.type === 'EARN' ? '#2e7d32' : '#d32f2f'}
        />
        <View style={styles.ledgerDetails}>
          <Text style={styles.ledgerNote}>{item.note}</Text>
          <Text style={styles.ledgerDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={[
        styles.ledgerAmount,
        { color: item.type === 'EARN' ? '#2e7d32' : '#d32f2f' }
      ]}>
        {item.type === 'EARN' ? '+' : '-'}{item.amount}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.pointsCard}>
          <Ionicons name="trophy" size={48} color="#ffd700" />
          <Text style={styles.pointsTitle}>Your Points</Text>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsSubtitle}>
            Keep recycling to earn more!
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading activity...</Text>
        ) : ledger.length > 0 ? (
          ledger.map(renderLedgerItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySubtext}>
              Start submitting waste to earn your first points!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 50,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 5,
  },
  pointsSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  ledgerItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ledgerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ledgerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  ledgerNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  ledgerDate: {
    fontSize: 12,
    color: '#666',
  },
  ledgerAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});