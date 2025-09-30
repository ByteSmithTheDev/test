
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { nanoid } from 'nanoid';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  phone: { type: String, unique: true, sparse: true },
  name: { type: String },
  role: { type: String, enum: ['USER','BUSINESS','ADMIN'], default: 'USER', index: true },
  passwordHash: { type: String, required: true },
  points: { type: Number, default: 0 },
  deviceSecrets: [{
    deviceId: { type: String, required: true },
    clientId: { type: String, required: true },
    secret: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

UserSchema.methods.setPassword = async function(pw) {
  this.passwordHash = await argon2.hash(pw);
};
UserSchema.methods.verifyPassword = async function(pw) {
  return argon2.verify(this.passwordHash, pw);
};

UserSchema.methods.issueDeviceSecret = function(deviceId) {
  const clientId = nanoid(8);
  const secret = nanoid(32);
  this.deviceSecrets = this.deviceSecrets.filter(d => d.deviceId !== deviceId);
  this.deviceSecrets.push({ deviceId, clientId, secret });
  return { clientId, secret };
};

export const User = mongoose.model('User', UserSchema);
