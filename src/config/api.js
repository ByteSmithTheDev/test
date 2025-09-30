const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  ROTATE_DEVICE: `${API_BASE_URL}/auth/rotate-device-secret`,
  
  // Ads
  ADS: `${API_BASE_URL}/ads`,
  MY_ADS: `${API_BASE_URL}/ads/my`,
  
  // Waste
  WASTE_SUBMIT: `${API_BASE_URL}/waste/submit`,
  WASTE_REVIEW: `${API_BASE_URL}/waste`,
  
  // Points
  POINTS_BALANCE: `${API_BASE_URL}/points/balance`,
  
  // Coupons
  COUPONS: `${API_BASE_URL}/coupons`,
  COUPONS_REDEEM: `${API_BASE_URL}/coupons/redeem`,
  COUPONS_VERIFY: `${API_BASE_URL}/coupons/verify`,
};

export default API_BASE_URL;