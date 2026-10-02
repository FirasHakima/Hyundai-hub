const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, OTP } = require("../models");
const { Sequelize } = require("sequelize");
const { createOTP, verifyOTP } = require("../utils/otp");
const { sendVerificationEmail } = require("../utils/email");
require("dotenv").config();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── Registration with email verification link ──────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Email invalide" });
    const lowerEmail = email.toLowerCase().trim();
    
    const existing = await User.findOne({ 
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), lowerEmail)
    });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email: lowerEmail, 
      password: hashedPassword, 
      phone,
      isVerified: false // Retour à la vérification obligatoire
    });
    
    try {
      await createOTP(lowerEmail, "registration");
      res.status(201).json({ 
        message: "Compte créé ! Veuillez vérifier votre email pour le code OTP.", 
        step: 2 
      });
    } catch (e) {
      console.error("Erreur envoi email inscription:", e.message);
      // On informe l'utilisateur mais on ne bloque pas tout
      res.status(201).json({ 
        message: "Compte créé, mais l'envoi de l'email a échoué. Contactez le support.",
        warning: "Vérifiez vos paramètres SMTP",
        step: 2
      });
    }
  } catch (err) { 
    console.error("Erreur Inscription:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await verifyOTP(email, code, "registration");
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ isVerified: true });
    
    const token = signToken(user);
    res.json({ 
      message: "Compte vérifié avec succès !", 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Email verification via link click ──────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ error: "Invalid link" });

    const otp = await OTP.findOne({ where: { email: email.toLowerCase(), code: token, purpose: "email_verification", used: false } });
    if (!otp) return res.status(400).json({ error: "Link invalid or already used" });
    if (new Date() > otp.expiresAt) return res.status(400).json({ error: "Link expired. Please register again." });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ isVerified: true });
    await otp.update({ used: true });

    res.json({ message: "Account verified successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Login (sends OTP) ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    console.log(`[LOGIN ATTEMPT] Email: ${lowerEmail}`);

    const user = await User.findOne({ 
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), lowerEmail)
    });

    if (!user) {
      console.log(`[LOGIN FAILED] Aucun compte trouvé pour: ${lowerEmail}`);
      return res.status(401).json({ error: 'Aucun compte trouvé avec cet email' });
    }

    console.log(`[LOGIN] Utilisateur trouvé: ${user.email} (ID: ${user.id})`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Mot de passe incorrect pour: ${lowerEmail}`);
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Force verification if not already done (per user request to fix quickly)
    if (!user.isVerified) {
      await user.update({ isVerified: true });
    }

    console.log(`[LOGIN SUCCESS] Connexion directe pour: ${lowerEmail}`);
    const token = signToken(user);
    res.json({ 
      message: "Connexion réussie", 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) { 
    console.error("[LOGIN ERROR]:", err);
    res.status(500).json({ error: err.message }); 
  }
};

// ── Verify login OTP ───────────────────────────────────────────────────────
exports.verifyLogin = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await verifyOTP(email, code, "login");
    if (!result.valid) return res.status(400).json({ error: result.reason });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Forgot / Reset Password ────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    
    // If account not verified, send registration OTP instead of login OTP
    const purpose = user.isVerified ? "login" : "registration";
    const code = await createOTP(email, purpose);
    res.json({ message: "OTP sent to your email", otp: code });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: "All fields are required" });
    const result = await verifyOTP(email, code, "login");
    if (!result.valid) return res.status(400).json({ error: result.reason });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hash });
    res.json({ message: "Password reset successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Account management ─────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    res.json({ message: "Account deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: "New email is required" });
    const exists = await User.findOne({ where: { email: newEmail } });
    if (exists) return res.status(400).json({ error: "Email already in use" });
    const code = await createOTP(newEmail, "login");
    res.json({ message: "OTP sent to new email", otp: code });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirmEmailChange = async (req, res) => {
  try {
    const { newEmail, code } = req.body;
    const result = await verifyOTP(newEmail, code, "login");
    if (!result.valid) return res.status(400).json({ error: result.reason });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update({ email: newEmail });
    const token = signToken({ ...user.dataValues, email: newEmail });
    res.json({ token, user: { id: user.id, name: user.name, email: newEmail, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
