import { API_ENDPOINTS } from '../config/api';
import { storage, KEYS } from '../utils/storage';
import { createHmacSignature, generateDeviceId } from '../utils/crypto';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async authenticatedRequest(endpoint, options = {}, requireHmac = false) {
    const token = await storage.getItem(KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token found');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    if (requireHmac) {
      const deviceId = await storage.getItem(KEYS.DEVICE_ID);
      const clientId = await storage.getItem(KEYS.CLIENT_ID);
      const secret = await storage.getItem(KEYS.DEVICE_SECRET);

      if (!deviceId || !clientId || !secret) {
        throw new Error('Device credentials not found');
      }

      const hmacHeaders = await createHmacSignature(deviceId, clientId, secret, options.body);
      Object.assign(headers, hmacHeaders);
    }

    return this.request(endpoint, {
      ...options,
      headers,
    });
  }

  // Auth methods
  async register(email, password, name) {
    const deviceId = generateDeviceId();
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, name, deviceId },
    });

    await this.storeAuthData(response, deviceId);
    return response;
  }

  async login(email, password) {
    const deviceId = await storage.getItem(KEYS.DEVICE_ID) || generateDeviceId();
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password, deviceId },
    });

    await this.storeAuthData(response, deviceId);
    return response;
  }

  async storeAuthData(response, deviceId) {
    await storage.setItem(KEYS.ACCESS_TOKEN, response.access);
    await storage.setItem(KEYS.REFRESH_TOKEN, response.refresh);
    await storage.setItem(KEYS.DEVICE_ID, deviceId);
    await storage.setItem(KEYS.CLIENT_ID, response.device.clientId);
    await storage.setItem(KEYS.DEVICE_SECRET, response.device.secret);
  }

  async refreshToken() {
    const refreshToken = await storage.getItem(KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: { refresh: refreshToken },
    });

    await storage.setItem(KEYS.ACCESS_TOKEN, response.access);
    return response;
  }

  async logout() {
    await storage.clear();
  }

  // Ads methods
  async getAds() {
    return this.request('/ads');
  }

  async getMyAds() {
    return this.authenticatedRequest('/ads/my');
  }

  async createAd(adData) {
    return this.authenticatedRequest('/ads', {
      method: 'POST',
      body: adData,
    });
  }

  // Waste methods
  async submitWaste(wasteData) {
    return this.authenticatedRequest('/waste/submit', {
      method: 'POST',
      body: wasteData,
    }, true);
  }

  // Points methods
  async getPointsBalance() {
    return this.authenticatedRequest('/points/balance', {}, true);
  }

  // Coupons methods
  async getCoupons() {
    return this.request('/coupons');
  }

  async redeemCoupon(couponId, idempotencyKey) {
    return this.authenticatedRequest('/coupons/redeem', {
      method: 'POST',
      body: { couponId, idempotencyKey },
    }, true);
  }

  async verifyCoupon(code) {
    return this.authenticatedRequest('/coupons/verify', {
      method: 'POST',
      body: { code },
    });
  }
}

export default new ApiService();