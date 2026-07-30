import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import * as admin from "firebase-admin";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "fs";

dotenv.config();

// ── Cloudinary ────────────────────────────────────────────────────────────────
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'l0fkfwps',
  api_key:    process.env.CLOUDINARY_API_KEY    || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

// Memory storage — files processed in RAM, streamed to Cloudinary
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

// Helper: stream buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, options: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const app = express();
const PORT = 3000;

// ── Firebase Admin Init ───────────────────────────────────────────────────────
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(configPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!getApps().length) {
      initializeApp({ projectId: firebaseConfig.projectId });
    }
  } catch (e) { console.error("Firebase Admin Init Error:", e); }
} else if (process.env.FIREBASE_PROJECT_ID) {
  if (!getApps().length) {
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  }
}

app.use(express.json({ limit: '50mb' }));

// ── Safe SMTP Transporter ─────────────────────────────────────────────────────
// Reads EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT from env vars.
// Falls back to logging if not configured — never crashes.
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  if (!user || !pass) {
    console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set — emails will be logged only");
    return null;
  }
  return nodemailer.createTransport({
    host, port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const transporter = createTransporter();

const sendMail = async (opts: nodemailer.SendMailOptions): Promise<void> => {
  if (!transporter) {
    console.log("📧 [SMTP not configured] Would send:", opts.subject, "to", opts.to);
    return;
  }
  opts.from = opts.from || `"ACA Platform" <${process.env.EMAIL_USER}>`;
  try {
    await transporter.sendMail(opts);
    console.log("📧 Email sent:", opts.subject, "→", opts.to);
  } catch (err) {
    console.error("📧 Email send failed:", err);
    throw err;
  }
};

// ── Gemini AI ─────────────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const generateSixDigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Email Logo (exact match to Logo.tsx) ──────────────────────────────────────
const getEmailLogo = () => `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;">
  <tr>
    <td valign="middle" style="padding-right:16px;">
      <div style="width:64px;height:64px;background:linear-gradient(145deg,#1a4a2e 0%,#0a2218 100%);border-radius:18px;position:relative;overflow:hidden;box-shadow:5px 10px 28px rgba(0,0,0,0.55),0 2px 6px rgba(0,0,0,0.35);">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.13) 0%,transparent 50%);border-radius:18px;"></div>
        <svg viewBox="0 0 100 100" width="64" height="64" style="display:block;padding:8%;position:relative;z-index:1;" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="et1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#15803d"/></linearGradient>
            <linearGradient id="eb1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient>
          </defs>
          <ellipse cx="50" cy="89" rx="13" ry="3.5" fill="rgba(74,222,128,0.14)"/>
          <path d="M50 88 V62" stroke="url(#et1)" stroke-width="6" stroke-linecap="round"/>
          <path d="M50 88 V62" stroke="rgba(255,255,255,0.14)" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M50 62 L32 50 L20 48 L16 36 L27 26 L50 32" fill="none" stroke="url(#eb1)" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M32 50 L34 40 L44 36" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>
          <path d="M50 62 L68 50 L80 48 L84 36 L73 26 L50 32" fill="none" stroke="url(#eb1)" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M68 50 L66 40 L56 36" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>
          <path d="M50 32 V17" stroke="url(#eb1)" stroke-width="2" stroke-linecap="round"/>
          <path d="M50 17 L39 12 M50 17 L61 12" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="16" cy="36" r="3" fill="#86efac"/>
          <circle cx="84" cy="36" r="3" fill="#86efac"/>
          <circle cx="27" cy="26" r="3" fill="#86efac"/>
          <circle cx="73" cy="26" r="3" fill="#86efac"/>
          <circle cx="39" cy="12" r="3.2" fill="#fbbf24"/>
          <circle cx="61" cy="12" r="3.2" fill="#fbbf24"/>
          <rect x="44" y="29" width="12" height="10" rx="2" fill="#0d1f10" stroke="#4ade80" stroke-width="1"/>
          <path d="M47 34 h6 M50 31.5 v5" stroke="#4ade80" stroke-width="0.7"/>
          <ellipse cx="34" cy="42" rx="6" ry="3" fill="rgba(255,255,255,0.06)" transform="rotate(-30,34,42)"/>
        </svg>
      </div>
    </td>
    <td valign="middle" style="text-align:left;">
      <div style="font-size:26px;font-weight:900;letter-spacing:-0.04em;line-height:1;text-transform:uppercase;color:#f0faf2;font-family:Arial,sans-serif;">
        ACA<span style="color:#4ade80;">.</span>Platform
      </div>
      <div style="font-size:8.5px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#6bbd8a;margin-top:6px;line-height:1;font-family:Arial,sans-serif;">
        Agricultural Crop Analysis
      </div>
    </td>
  </tr>
</table>`;

// ── Reusable email wrapper ────────────────────────────────────────────────────
const emailWrapper = (title: string, body: string, footerNote = "") => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f0f4f1;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4f1;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0d2218 0%,#1a4a2e 100%);border-radius:24px 24px 0 0;padding:36px 40px 32px;text-align:center;">
    ${getEmailLogo()}
  </td></tr>
  <!-- Body -->
  <tr><td style="background:#ffffff;padding:48px 40px 40px;border-left:1px solid #e2ebe4;border-right:1px solid #e2ebe4;">
    ${body}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#0d2218;border-radius:0 0 24px 24px;padding:28px 40px;text-align:center;">
    ${footerNote ? `<p style="font-size:13px;color:#6bbd8a;font-weight:500;margin:0 0 16px;line-height:1.7;">${footerNote}</p>` : ""}
    <p style="font-size:11px;color:#3d6649;margin:0;">© 2025 ACA Platform — Agricultural Crop Analysis</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

// ── Security notification (used internally) ───────────────────────────────────
async function sendSecurityNotification(email: string, event: string, details: string) {
  await sendMail({
    to: email,
    subject: `🔒 Security Alert — ${event} on your ACA account`,
    html: emailWrapper(
      `Security Alert — ${event}`,
      `<h2 style="font-size:24px;font-weight:900;color:#0d1f10;margin:0 0 16px;">Security Alert 🔒</h2>
       <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.7;">${details}</p>
       <p style="font-size:14px;color:#6b7280;line-height:1.7;">If this was not you, please reset your password immediately.</p>`,
      "🛡️ This is an automated security notification from ACA Platform."
    ),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── Newsletter Subscribe ──────────────────────────────────────────────────────
app.post("/api/send-subscription-email", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required." });
  }

  try {
    const db = getFirestore();
    const subRef = db.collection("newsletter_subscribers").doc(email);
    const subDoc = await subRef.get();

    if (subDoc.exists) {
      return res.status(400).json({ error: "You are already subscribed! 🌾" });
    }

    await subRef.set({ email, subscribedAt: Timestamp.now(), active: true });

    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const unsubLink = `${origin}/unsubscribe?email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: "🌱 Welcome to ACA Newsletter — You're subscribed!",
      html: emailWrapper(
        "Subscribed to ACA Newsletter",
        `<h1 style="font-size:28px;font-weight:900;color:#0d1f10;margin:0 0 8px;letter-spacing:-0.02em;">You're in! 🎉</h1>
         <p style="font-size:16px;color:#16a34a;font-weight:700;margin:0 0 28px;">Welcome to the ACA Platform Newsletter</p>
         <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.7;">
           Thanks for subscribing. Every week you'll receive the best agricultural insights, smart farming tips, crop market updates, and new feature announcements — straight to your inbox.
         </p>
         <div style="background:#f0faf2;border:1px solid #bbf7d0;border-radius:16px;padding:20px 24px;margin:0 0 32px;">
           <p style="font-size:14px;color:#166534;font-weight:700;margin:0 0 12px;">📬 What to expect:</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">🌾 Weekly crop insights &amp; weather alerts</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">💡 Smart farming tips from AI &amp; experts</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">📈 Market price trends &amp; predictions</p>
           <p style="font-size:13px;color:#166534;margin:0;">🆕 New ACA features as we launch them</p>
         </div>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:8px 0 36px;">
           <a href="${origin}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:16px;box-shadow:0 8px 24px rgba(22,163,74,0.35);">
             🌱 Go to ACA Platform
           </a>
         </td></tr></table>
         <p style="font-size:12px;color:#9ca3af;text-align:center;">
           <a href="${unsubLink}" style="color:#9ca3af;">Unsubscribe</a> · You subscribed with ${email}
         </p>`,
        "🛡️ You can unsubscribe at any time by clicking the link above."
      ),
    });

    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (e: any) {
    console.error("Subscription error:", e);
    res.status(500).json({ error: "Failed to subscribe: " + e.message });
  }
});

// ── Newsletter Unsubscribe ────────────────────────────────────────────────────
app.post("/api/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const db = getFirestore();
    await db.collection("newsletter_subscribers").doc(email).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

// ── Send Welcome Email (called after signup) ──────────────────────────────────
app.post("/api/send-welcome", async (req, res) => {
  const { email, firstName } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const name = firstName || "Farmer";
  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  try {
    await sendMail({
      to: email,
      subject: `🌱 Welcome to ACA Platform, ${name}!`,
      html: emailWrapper(
        `Welcome to ACA Platform`,
        `<h1 style="font-size:28px;font-weight:900;color:#0d1f10;margin:0 0 8px;letter-spacing:-0.02em;">
           Welcome, <span style="color:#16a34a;">${name}</span>! 👋
         </h1>
         <p style="font-size:15px;color:#5a7a62;font-weight:500;margin:0 0 32px;line-height:1.7;">
           Your ACA Platform account is ready. You now have access to AI-powered crop analysis, market prices, weather forecasts, and a global farming community.
         </p>
         <div style="background:#f0faf2;border:1px solid #bbf7d0;border-radius:16px;padding:20px 24px;margin:0 0 32px;">
           <p style="font-size:13px;font-weight:700;color:#166534;margin:0 0 12px;">🚀 Get started with these features:</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">📸 <b>Scan your crops</b> — Upload a photo for instant AI disease diagnosis</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">📈 <b>Market prices</b> — Check live global commodity prices</p>
           <p style="font-size:13px;color:#166534;margin:0 0 6px;">🌦️ <b>Weather forecast</b> — 7-day hyperlocal farming forecast</p>
           <p style="font-size:13px;color:#166534;margin:0;">📚 <b>Education hub</b> — Free courses, books, and expert guides</p>
         </div>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:8px 0 36px;">
           <a href="${origin}/dashboard" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:16px;box-shadow:0 8px 24px rgba(22,163,74,0.35);">
             🌾 Go to My Dashboard
           </a>
         </td></tr></table>`,
        "🛡️ If you did not create this account, please ignore this email."
      ),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Email Verification ────────────────────────────────────────────────────────
app.post("/api/send-custom-verification", async (req, res) => {
  const { email, displayName } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const name = displayName || "Farmer";
  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;

  try {
    const auth = getAuth();
    let link = "";
    try {
      link = await auth.generateEmailVerificationLink(email);
    } catch {
      link = `${origin}/verify-email`;
    }

    await sendMail({
      to: email,
      subject: `✅ Verify your email for ACA Platform`,
      html: emailWrapper(
        "Verify your email — ACA Platform",
        `<h1 style="font-size:28px;font-weight:900;color:#0d1f10;margin:0 0 8px;letter-spacing:-0.02em;">
           Welcome aboard, <span style="color:#16a34a;">${name}</span>! 👋
         </h1>
         <p style="font-size:15px;color:#5a7a62;font-weight:500;margin:0 0 32px;line-height:1.7;">
           You're one step away from smarter farming. Confirm your email and unlock the full power of ACA.
         </p>
         <div style="background:#f0faf2;border:1px solid #bbf7d0;border-radius:16px;padding:20px 24px;margin:0 0 32px;">
           <table cellpadding="0" cellspacing="0" border="0"><tr>
             <td style="font-size:24px;vertical-align:top;padding-right:14px;">🔐</td>
             <td style="font-size:14px;color:#166534;font-weight:500;line-height:1.7;">
               <b style="display:block;color:#14532d;margin-bottom:3px;">Why verify?</b>
               Keeps your farm data safe, lets us send important alerts, and ensures you never lose account access.
             </td>
           </tr></table>
         </div>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:8px 0 36px;">
           <a href="${link}" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:16px;box-shadow:0 8px 24px rgba(22,163,74,0.35);">
             ✅ Verify My Email
           </a>
         </td></tr></table>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;">
           <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px;">Button not working? Copy this link:</p>
           <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0;">${link}</p>
         </td></tr></table>`,
        "🛡️ Didn't create an ACA account? You can safely ignore this email."
      ),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Password Reset ────────────────────────────────────────────────────────────
app.post("/api/send-custom-password-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;

  try {
    const auth = getAuth();
    let link = "";
    try {
      link = await auth.generatePasswordResetLink(email);
    } catch {
      const token = generateToken();
      link = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    }

    await sendMail({
      to: email,
      subject: "🔑 Reset your ACA Platform password",
      html: emailWrapper(
        "Reset your password — ACA Platform",
        `<h1 style="font-size:28px;font-weight:900;color:#0d1f10;margin:0 0 8px;letter-spacing:-0.02em;">
           Reset your password 🔑
         </h1>
         <p style="font-size:15px;color:#5a7a62;font-weight:500;margin:0 0 32px;line-height:1.7;">
           We received a request to reset your ACA Platform password. Click the button below to choose a new one.
         </p>
         <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:20px 24px;margin:0 0 32px;">
           <table cellpadding="0" cellspacing="0" border="0"><tr>
             <td style="font-size:24px;vertical-align:top;padding-right:14px;">⏰</td>
             <td style="font-size:14px;color:#c2410c;font-weight:500;line-height:1.7;">
               <b style="display:block;color:#9a3412;margin-bottom:3px;">This link expires in 1 hour.</b>
               If you didn't request a password reset, you can safely ignore this email — your password won't change.
             </td>
           </tr></table>
         </div>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:8px 0 36px;">
           <a href="${link}" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:16px;box-shadow:0 8px 24px rgba(22,163,74,0.35);">
             🔑 Reset My Password
           </a>
         </td></tr></table>
         <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;">
           <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px;">Link not working? Copy into your browser:</p>
           <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0;">${link}</p>
         </td></tr></table>`,
        "🛡️ If you didn't request this, your account is safe — just ignore this email."
      ),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Reset password with token ─────────────────────────────────────────────────
app.post("/api/reset-password-with-token", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: "Email and new password required" });
  try {
    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    await sendSecurityNotification(email, "Password Reset", `Your password was successfully reset on ${new Date().toLocaleString()}.`);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Delete Account ────────────────────────────────────────────────────────────
app.post("/api/delete-account", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const db = getFirestore();
    const auth = getAuth();
    // Get profile for email
    const profile = await db.collection("profiles").doc(userId).get();
    const email = profile.data()?.email;
    // Delete Firestore data
    const batch = db.batch();
    batch.delete(db.collection("profiles").doc(userId));
    const posts = await db.collection("posts").where("userId", "==", userId).get();
    posts.docs.forEach(d => batch.delete(d.ref));
    const logs = await db.collection("farm_logs").where("userId", "==", userId).get();
    logs.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    // Delete Firebase Auth user
    try { await auth.deleteUser(userId); } catch {}
    // Send goodbye email
    if (email) {
      await sendMail({
        to: email,
        subject: "Your ACA account has been deleted",
        html: emailWrapper("Account Deleted",
          `<h2 style="font-size:22px;font-weight:900;color:#0d1f10;margin:0 0 16px;">Account deleted 👋</h2>
           <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">Your ACA Platform account and all associated data have been permanently deleted as requested.</p>
           <p style="font-size:15px;color:#374151;line-height:1.7;">We're sorry to see you go. You're always welcome back — create a new account anytime.</p>`,
          "Thank you for being part of the ACA community."
        ),
      });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Reset User Data ───────────────────────────────────────────────────────────
app.post("/api/reset-user-data", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const db = getFirestore();
    await db.collection("profiles").doc(userId).set({
      onboarded: false, updatedAt: Timestamp.now()
    }, { merge: true });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Security Notification Endpoint ────────────────────────────────────────────
app.post("/api/send-security-notification", async (req, res) => {
  const { email, event, details } = req.body;
  try {
    await sendSecurityNotification(email, event, details);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Industry Partner: Apply ───────────────────────────────────────────────────
app.post("/api/industry/apply", async (req, res) => {
  const { userId, userEmail, userName, businessName, businessType, website, contactEmail, contactPhone, description } = req.body;
  if (!userId || !businessName || !contactEmail) return res.status(400).json({ error: "Missing fields" });
  try {
    const db = getFirestore();
    await db.collection("profiles").doc(userId).set({ industry_request_pending: true }, { merge: true });
    await db.collection("industry_applications").add({
      userId, userEmail, userName, businessName, businessType,
      website: website || "", contactEmail, contactPhone: contactPhone || "",
      description, status: "pending", createdAt: Timestamp.now()
    });
    await sendMail({
      to: process.env.EMAIL_USER || "khmbabi@gmail.com",
      subject: `🌿 New Industry Partner Application — ${businessName}`,
      html: emailWrapper("New Industry Application",
        `<h2 style="font-size:22px;font-weight:900;color:#0d1f10;margin:0 0 16px;">New Industry Partner Application</h2>
         <p><b>Business:</b> ${businessName} (${businessType})</p>
         <p><b>Applicant:</b> ${userName} — ${userEmail}</p>
         <p><b>Contact:</b> ${contactEmail} ${contactPhone ? "/ " + contactPhone : ""}</p>
         <p><b>Website:</b> ${website || "N/A"}</p>
         <p><b>Description:</b> ${description}</p>
         <p><b>User ID:</b> ${userId}</p>`
      ),
    });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Industry Partner: Approve ─────────────────────────────────────────────────
app.post("/api/industry/approve", async (req, res) => {
  const { adminId, userId, approved, category } = req.body;
  if (!adminId || !userId) return res.status(400).json({ error: "Missing fields" });
  try {
    const db = getFirestore();
    const adminProfile = await db.collection("profiles").doc(adminId).get();
    if (!adminProfile.exists || !adminProfile.data()?.is_admin) return res.status(403).json({ error: "Unauthorized" });
    const userProfile = await db.collection("profiles").doc(userId).get();
    const userEmail = userProfile.data()?.email || "";
    await db.collection("profiles").doc(userId).set({
      is_industry: approved, industry_verified: approved,
      industry_category: category || "", industry_request_pending: false,
    }, { merge: true });
    const apps = await db.collection("industry_applications").where("userId", "==", userId).where("status", "==", "pending").get();
    const batch = db.batch();
    apps.docs.forEach(d => batch.update(d.ref, { status: approved ? "approved" : "rejected" }));
    await batch.commit();
    if (userEmail) {
      await sendMail({
        to: userEmail,
        subject: approved ? "🎉 ACA Industry Partner — Application Approved!" : "ACA Industry Application Update",
        html: emailWrapper(
          approved ? "Application Approved" : "Application Update",
          approved
            ? `<h2 style="color:#16a34a;font-size:24px;font-weight:900;margin:0 0 16px;">Congratulations! ✅</h2>
               <p style="font-size:15px;color:#374151;line-height:1.7;">Your Industry Partner application has been approved. You now have a verified badge on ACA Platform and can post products, advertise, and display your contact info to thousands of farmers worldwide.</p>`
            : `<h2 style="font-size:24px;font-weight:900;color:#0d1f10;margin:0 0 16px;">Application Update</h2>
               <p style="font-size:15px;color:#374151;line-height:1.7;">We reviewed your Industry Partner application and are unable to approve it at this time. Please contact us for more information.</p>`
        ),
      });
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Admin Stats ───────────────────────────────────────────────────────────────
app.get("/api/admin/stats", async (req, res) => {
  const { adminEmail } = req.query;
  if (adminEmail !== "khmbabi@gmail.com") return res.status(403).json({ error: "Unauthorized" });
  try {
    const db = getFirestore();
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [profiles, posts, subscribers, industryApps] = await Promise.all([
      db.collection("profiles").get(),
      db.collection("posts").get(),
      db.collection("newsletter_subscribers").get(),
      db.collection("industry_applications").get(),
    ]);
    const usersByDay: Record<string, number> = {};
    let newUsersLast7 = 0;
    profiles.docs.forEach(d => {
      const data = d.data();
      if (data.createdAt) {
        const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (date > last7) newUsersLast7++;
        if (date > last30) {
          const key = date.toISOString().split("T")[0];
          usersByDay[key] = (usersByDay[key] || 0) + 1;
        }
      }
    });
    res.json({
      totalUsers: profiles.size,
      totalPosts: posts.size,
      totalSubscribers: subscribers.size,
      pendingIndustryApps: industryApps.docs.filter(d => d.data().status === "pending").length,
      newUsersLast7,
      usersByDay,
      industryPartners: profiles.docs.filter(d => d.data().industry_verified).length,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Admin: Industry Apps ──────────────────────────────────────────────────────
app.get("/api/admin/industry-apps", async (req, res) => {
  const { adminEmail } = req.query;
  if (adminEmail !== "khmbabi@gmail.com") return res.status(403).json({ error: "Unauthorized" });
  try {
    const db = getFirestore();
    const apps = await db.collection("industry_applications").orderBy("createdAt", "desc").get();
    res.json({ apps: apps.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Admin Log Bot ─────────────────────────────────────────────────────────────
app.post("/api/admin/analyse-logs", async (req, res) => {
  const { adminEmail, logs } = req.body;
  if (adminEmail !== "khmbabi@gmail.com") return res.status(403).json({ error: "Unauthorized" });
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `You are an expert DevOps engineer for ACA Platform, an agricultural AI web app.
Analyse these logs and give a structured report:

${logs}

Respond with:
1. **Summary** — what happened overall
2. **2xx Responses** — successful requests
3. **3xx Redirects** — any redirect issues
4. **4xx Client Errors** — which endpoints are failing and why
5. **5xx Server Errors** — critical issues to fix immediately
6. **Top Issues** — ranked by severity
7. **Recommendations** — concrete next steps

Be specific, practical, concise. Use markdown.`
    });
    res.json({ analysis: response.text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── AI Proxy ──────────────────────────────────────────────────────────────────
app.post("/api/ai", async (req, res) => {
  const { type, data, mode, symptoms } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "GEMINI_API_KEY not configured on server." });
  }
  try {
    if (type === "analyzeCropDisease") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [{
          parts: [
            { text: `You are a Global Agricultural Pathologist. Analyze this crop image.
UNIVERSAL: Supports ALL crop types worldwide. Symptoms: ${symptoms || "None provided"}.
1. Identify plant type
2. Identify disease/pest/deficiency
3. Confidence level (%)
4. Organic AND chemical treatments
5. Symptoms Description
6. Prevention
${mode === "instant" ? "Be concise. Include 1 YouTube tutorial link." : "Be detailed. Include 2-3 web links + 1 YouTube link under Resources."}` },
            { inlineData: { mimeType: "image/jpeg", data: (data || "").split(",")[1] || data } },
          ],
        }],
      });
      res.json({ text: response.text });
    }
    else if (type === "getCropRecommendation") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: `Recommend the best crops for this farm.
Altitude: ${data?.altitude}m | Market: ${data?.marketPreference} | Description: ${data?.description}
Data: ${JSON.stringify(data)}
${mode === "instant" ? "Be direct and short." : "Be comprehensive. Include links and YouTube video."}`,
      });
      res.json({ text: response.text });
    }
    else if (type === "getAnimalRecommendation") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: `Recommend the best livestock for this farm.
Altitude: ${data?.altitude}m | Goal: ${data?.primaryGoal} | Description: ${data?.description}
Data: ${JSON.stringify(data)}
${mode === "instant" ? "Be brief and practical." : "Be comprehensive. Include links and YouTube video."}`,
      });
      res.json({ text: response.text });
    }
    else if (type === "translate") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Translate to ${data?.targetLanguage}. Return ONLY the translation, no notes.
Text: "${data?.text}"`,
      });
      res.json({ text: response.text });
    }
    else if (type === "moderateContent") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are a content moderator for an agricultural farming community.
Check this text for profanity, hate speech, spam, or content completely unrelated to farming.
Respond ONLY with valid JSON (no markdown): {"safe": true} or {"safe": false, "reason": "brief reason"}

Text: "${data?.text}"`,
      });
      const raw = (response.text || '{"safe":true}').replace(/```json|```/g, "").trim();
      try { res.json(JSON.parse(raw)); } catch { res.json({ safe: true }); }
    }
    else if (type === "chatbot") {
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: data?.messages || [],
        config: { tools: [{ googleSearch: {} }] },
      });
      res.json({ text: response.text });
    }
    else {
      res.status(400).json({ error: "Invalid request type" });
    }
  } catch (e: any) {
    console.error("AI Error:", e);
    res.status(500).json({ error: e.message || "AI service error" });
  }
});


// ── News Proxy ────────────────────────────────────────────────────────────────
app.get("/api/news", async (req, res) => {
  const NEWS_KEY = process.env.NEWSDATA_API_KEY;
  if (!NEWS_KEY) return res.status(503).json({ error: "NEWSDATA_API_KEY not configured" });
  const { q = "agriculture", page } = req.query;
  try {
    let url = `https://newsdata.io/api/1/news?apikey=${NEWS_KEY}&q=${encodeURIComponent(q as string)}&language=en`;
    if (page) url += `&page=${page}`;
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    res.status(r.status).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Weather Proxy ─────────────────────────────────────────────────────────────
app.get("/api/weather", async (req, res) => {
  const OWM_KEY = process.env.OPENWEATHER_API_KEY;
  if (!OWM_KEY) return res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
  const { q, type = "current" } = req.query;
  if (!q) return res.status(400).json({ error: "Location required" });
  try {
    const ep = type === "forecast" ? "forecast" : "weather";
    const url = `https://api.openweathermap.org/data/2.5/${ep}?q=${encodeURIComponent(q as string)}&appid=${OWM_KEY}&units=metric`;
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(r.status).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Crops Proxy ───────────────────────────────────────────────────────────────
app.get("/api/crops", async (req, res) => {
  const PERENUAL_KEY = process.env.PERENUAL_API_KEY;
  if (!PERENUAL_KEY) return res.status(503).json({ error: "PERENUAL_API_KEY not configured" });
  const { path: p = "species-list", page = "1", q, id } = req.query;
  try {
    let url = `https://perenual.com/api/v2/${p}?key=${PERENUAL_KEY}&page=${page}&indoor=0`;
    if (q) url += `&q=${encodeURIComponent(q as string)}`;
    if (id) url += `/${id}`;
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    res.status(r.status).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});


// ── Cloudinary: Upload Education Media ────────────────────────────────────────
// Accepts: video, pdf, image — stores in Cloudinary under /aca/education/
app.post('/api/education/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const { type = 'auto', folder = 'aca/education', title = '' } = req.body;

  // Validate Cloudinary is configured
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ 
      error: 'Cloudinary not configured. Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment variables.' 
    });
  }

  try {
    const mime = req.file.mimetype;
    let resourceType: 'video' | 'image' | 'raw' | 'auto' = 'auto';
    let subfolder = folder;

    if (mime.startsWith('video/')) {
      resourceType = 'video';
      subfolder = 'aca/education/videos';
    } else if (mime === 'application/pdf') {
      resourceType = 'raw';
      subfolder = 'aca/education/pdfs';
    } else if (mime.startsWith('image/')) {
      resourceType = 'image';
      subfolder = 'aca/education/images';
    }

    const publicId = `${subfolder}/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: resourceType,
      public_id: publicId,
      overwrite: false,
      ...(resourceType === 'video' && {
        eager: [{ streaming_profile: 'full_hd', format: 'm3u8' }],
        eager_async: true,
      }),
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + (err.message || err.error?.message || 'Unknown error') });
  }
});

// ── Cloudinary: Delete Education Media ────────────────────────────────────────
app.delete('/api/education/upload', async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  if (!publicId) return res.status(400).json({ error: 'publicId required' });
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Cloudinary: Sign upload (for direct browser upload fallback) ──────────────
app.post('/api/education/sign-upload', (req, res) => {
  const { folder = 'aca/education', resourceType = 'auto' } = req.body;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = { timestamp, folder, resource_type: resourceType };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET || '');
  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'l0fkfwps',
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  });
});

// ── Server Start ──────────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, () => console.log(`🌱 ACA Server running on http://localhost:${PORT}`));
}

startServer().catch(console.error);
