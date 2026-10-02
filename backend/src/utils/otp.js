const { OTP } = require('../models');
const { sendOTPEmail } = require('./email');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createOTP = async (email, purpose) => {
  await OTP.destroy({ where: { email, purpose, used: false } });
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);
  await OTP.create({ email, code, purpose, expiresAt });
  await sendOTPEmail(email, code, purpose);
  return code;
};

const verifyOTP = async (email, code, purpose) => {
  const otp = await OTP.findOne({ where: { email, code, purpose, used: false } });
  if (!otp) return { valid: false, reason: 'Invalid OTP' };
  if (new Date() > otp.expiresAt) return { valid: false, reason: 'OTP expired' };
  await otp.update({ used: true });
  return { valid: true };
};

module.exports = { createOTP, verifyOTP };
