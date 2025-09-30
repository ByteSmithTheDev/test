import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  DEVICE_ID: 'device_id',
  CLIENT_ID: 'client_id',
  DEVICE_SECRET: 'device_secret',
  USER_DATA: 'user_data',
};

export const storage = {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  async clear() {
    try {
      await Promise.all(Object.values(KEYS).map(key => SecureStore.deleteItemAsync(key)));
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

export { KEYS };