import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

export default function CouponsScreen() {
  const [coupons, setCoupons] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [couponsResponse, pointsResponse] = await Promise.all([
        apiService.getCoupons(),
        apiService.getPointsBalance().catch(() => ({ points: 0 }))
      ]);
      
      setCoupons(couponsResponse.items || []);
      setUserPoints(pointsResponse.points || 0);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRedeem = async (coupon) => {
    if (userPoints < coupon.pointsCost) {
      Alert.alert(
        'Insufficient Points',
        `You need ${coupon.pointsCost} points to redeem this coupon. You currently have ${userPoints} points.`
      );
      return;
    }

    Alert.alert(
      'Redeem Coupon',
      `Are you sure you want to redeem "${coupon.title}" for ${coupon.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              const idempotencyKey = Date.now().toString() + Math.random().toString(36);
              const response = await apiService.redeemCoupon(coupon._id, idempotencyKey);
              
              Alert.alert(
                'Success!',
                `Coupon redeemed successfully!\n\nYour redemption code: ${response.code}\n\nShow this code to the business to use your coupon.`,
                [{ text: 'OK', onPress: () => loadData() }]
              );
            } catch (error) {
              Alert.alert('Redemption Failed', error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderCoupon = (coupon) => (
    <View key={coupon._id} style={styles.couponCard}>
      <View style={styles.couponHeader}>
        <Text style={styles.couponTitle}>{coupon.title}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{coupon.pointsCost} pts</Text>
        </View>
      </View>
      
      {coupon.description && (
        <Text style={styles.couponDescription}>{coupon.description}</Text>
      )}
      
      <View style={styles.couponFooter}>
        <View style={styles.couponInfo}>
          <Text style={styles.stockText}>Stock: {coupon.stock}</Text>
          <Text style={styles.expiryText}>
            Valid until: {formatDate(coupon.validTo)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.redeemButton,
            (userPoints < coupon.pointsCost || coupon.stock <= 0) && styles.redeemButtonDisabled
          ]}
          onPress={() => handleRedeem(coupon)}
          disabled={userPoints < coupon.pointsCost || coupon.stock <= 0}
        >
          <Text style={[
            styles.redeemButtonText,
            (userPoints < coupon.pointsCost || coupon.stock <= 0) && styles.redeemButtonTextDisabled
          ]}>
            {coupon.stock <= 0 ? 'Out of Stock' : 'Redeem'}
          </Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Available Coupons</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="leaf" size={20} color="#2e7d32" />
          <Text style={styles.headerPoints}>{userPoints} Points</Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading coupons...</Text>
        ) : coupons.length > 0 ? (
          coupons.map(renderCoupon)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No coupons available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new offers!
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerPoints: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  content: {
    padding: 20,
  },
  couponCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  pointsBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  couponInfo: {
    flex: 1,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#666',
  },
  redeemButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  redeemButtonTextDisabled: {
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
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