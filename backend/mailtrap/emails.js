import {
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
  } from './emailTemplates.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
    },
    tls: {
    rejectUnauthorized: false, // Optional: Disable strict certificate validation (use only for testing)
    },
    family: 4, // Force IPv4
});

const sender = {
  name: "Technix Workout",
  email: process.env.SMTP_FROM_EMAIL
};

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
    });
  } catch (error) {
    console.error('Verification email error:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
      // Add debug logging
      console.log('Sending welcome email:', { email, name });
      console.log('Template before replacement:', WELCOME_EMAIL_TEMPLATE);
      
      const personalizedHtml = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);
      console.log('Personalized HTML:', personalizedHtml);
  
      const mailOptions = {
        from: `"${sender.name}" <${sender.email}>`,
        to: email,
        subject: "Welcome to Technix Workout",
        html: personalizedHtml
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email send info:', info);
      return info;
    } catch (error) {
      console.error('Detailed Welcome email error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  };

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
    });
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE
    });
  } catch (error) {
    console.error('Password reset success email error:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};