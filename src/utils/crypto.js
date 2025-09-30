import { Platform } from 'react-native';

// Simple HMAC implementation for React Native
async function hmacSha256(key, message) {
  if (Platform.OS === 'web') {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // For mobile, we'll use a simple implementation
    // In production, you'd want to use a proper crypto library like react-native-crypto
    const crypto = require('crypto');
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }
}

export function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export async function createHmacSignature(deviceId, clientId, secret, body = {}) {
  const nonce = generateNonce();
  const timestamp = Date.now().toString();
  const bodyString = JSON.stringify(body);
  
  const base = `${deviceId}.${clientId}.${nonce}.${timestamp}.${bodyString}`;
  const signature = await hmacSha256(secret, base);
  
  return {
    'X-Device-Id': deviceId,
    'X-Client-Id': clientId,
    'X-Nonce': nonce,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
}