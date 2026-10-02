const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (to, code, purpose) => {
  const subjects = {
    login:        'Votre code de connexion Hyundai Hub',
    registration: 'Activez votre compte Hyundai Hub',
    appointment:  'Confirmez votre rendez-vous Hyundai',
  };
  const messages = {
    login:        'Votre code de vérification est :',
    registration: 'Votre code d\'activation de compte est :',
    appointment:  'Votre code de confirmation de RDV est :',
  };

  await transporter.sendMail({
    from: `"Hyundai Hub" <${process.env.EMAIL_FROM}>`,
    to,
    subject: subjects[purpose] || 'Your verification code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0b;color:#f0f0f0;border-radius:16px;overflow:hidden">
        <div style="background:#002C5F;padding:40px 20px;text-align:center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png" 
               alt="Hyundai" 
               style="height:32px;width:auto;display:block;margin:0 auto;filter:brightness(0) invert(1);" />
          <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:10px;letter-spacing:4px;font-weight:700;text-transform:uppercase">Service Hub</p>
        </div>
        <div style="padding:32px;text-align:center">
          <p style="color:#a0a0a8;font-size:15px;margin-bottom:24px">${messages[purpose] || 'Your code is:'}</p>
          <div style="background:#1a1a1f;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin:0 auto;display:inline-block">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#fff">${code}</span>
          </div>
          <p style="color:#5a5a65;font-size:13px;margin-top:24px">Ce code expire dans 10 minutes.<br>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      </div>
    `,
  });
};

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `http://localhost:5173/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
  await transporter.sendMail({
    from: `"Hyundai Hub" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Activez votre compte Hyundai Hub',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0b;color:#f0f0f0;border-radius:16px;overflow:hidden">
        <div style="background:#002C5F;padding:40px 20px;text-align:center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png" 
               alt="Hyundai" 
               style="height:32px;width:auto;display:block;margin:0 auto;filter:brightness(0) invert(1);" />
          <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:10px;letter-spacing:4px;font-weight:700;text-transform:uppercase">Service Hub</p>
        </div>
        <div style="padding:32px;text-align:center">
          <h2 style="color:#fff;font-size:20px;margin-bottom:12px">Bienvenue chez Hyundai Hub !</h2>
          <p style="color:#a0a0a8;font-size:15px;margin-bottom:32px">Cliquez sur le bouton ci-dessous pour activer votre compte. Ce lien est valable 24 heures.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#002C5F;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.5px">
            ✅ Activer mon compte
          </a>
          <p style="color:#5a5a65;font-size:12px;margin-top:32px">Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendVerificationEmail };
