require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirt-design-app',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
  
  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || 'user@example.com',
  SMTP_PASS: process.env.SMTP_PASS || 'password',
  EMAIL_FROM: process.env.EMAIL_FROM || 'designs@styledev.in',
  
  // Frontend URL for links in emails
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://styledev.in',
  
  // File storage paths
  UPLOADS_DIR: process.env.UPLOADS_DIR || 'uploads',
  DESIGNS_PREVIEWS_DIR: process.env.DESIGNS_PREVIEWS_DIR || 'uploads/designs/previews',
  DESIGNS_CHALLANS_DIR: process.env.DESIGNS_CHALLANS_DIR || 'uploads/designs/challans',
  CLIPART_DIR: process.env.CLIPART_DIR || 'uploads/clipart',
  USER_UPLOADS_DIR: process.env.USER_UPLOADS_DIR || 'uploads/user-uploads',
  
  // Pricing configuration
  BASE_TSHIRT_PRICE: process.env.BASE_TSHIRT_PRICE || 250, // Rs 250
  TEXT_PRINTING_COST: process.env.TEXT_PRINTING_COST || 100, // Rs 100
  IMAGE_PRINTING_COST: process.env.IMAGE_PRINTING_COST || 100, // Rs 100
  BACK_DESIGN_COST: process.env.BACK_DESIGN_COST || 100, // Rs 100
  STANDARD_SHIPPING_COST: process.env.STANDARD_SHIPPING_COST || 100, // Rs 100
  RUSH_SHIPPING_COST: process.env.RUSH_SHIPPING_COST || 300, // Rs 300
  TAX_RATE: process.env.TAX_RATE || 0.18, // 18% GST
};
