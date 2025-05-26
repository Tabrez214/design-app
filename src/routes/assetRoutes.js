const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Asset = require('../models/assetModel');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    
    if (req.body.type === 'clipart') {
      uploadDir = path.join(__dirname, '../../uploads/clipart');
      
      // Create category directory if it doesn't exist
      if (req.body.category) {
        uploadDir = path.join(uploadDir, req.body.category);
      }
    } else {
      uploadDir = path.join(__dirname, '../../uploads/user-uploads');
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${req.body.type || 'user'}-image-${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Only image files are allowed'));
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   POST /api/assets/images
 * @desc    Upload an image
 * @access  Public
 */
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get file path relative to uploads directory
    const filePath = req.file.path.split('uploads')[1];
    const url = `/uploads${filePath}`;
    
    // Create thumbnail (simplified - in a real app, you'd generate an actual thumbnail)
    const thumbnailUrl = url; // Using same URL for now
    
    // Create new asset document
    const newAsset = new Asset({
      type: req.body.type || 'uploaded',
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      url,
      thumbnailUrl,
      dimensions: {
        width: req.body.width || 500, // Default values - in a real app, you'd extract from the image
        height: req.body.height || 500
      },
      metadata: {
        uploadedBy: req.body.uploadedBy || 'user',
        originalFilename: req.file.originalname
      }
    });
    
    // Save asset to database
    await newAsset.save();
    
    res.status(201).json({
      success: true,
      url,
      thumbnailUrl,
      assetId: newAsset._id,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading image'
    });
  }
});

/**
 * @route   GET /api/assets/clipart/categories
 * @desc    Get all clipart categories
 * @access  Public
 */
router.get('/clipart/categories', async (req, res) => {
  try {
    // Find all unique categories
    const categories = await Asset.distinct('category', { 
      type: 'clipart',
      isActive: true
    });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching clipart categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clipart categories'
    });
  }
});

/**
 * @route   GET /api/assets/clipart/category/:categoryId
 * @desc    Get clipart by category
 * @access  Public
 */
router.get('/clipart/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Find all clipart in the category
    const clipart = await Asset.find({
      type: 'clipart',
      category: categoryId,
      isActive: true
    }).select('url thumbnailUrl dimensions tags');
    
    res.json({
      success: true,
      category: categoryId,
      clipart
    });
  } catch (error) {
    console.error('Error fetching clipart by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clipart'
    });
  }
});

/**
 * @route   GET /api/assets/clipart/search
 * @desc    Search clipart by tags
 * @access  Public
 */
router.get('/clipart/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search clipart by tags
    const clipart = await Asset.find({
      type: 'clipart',
      isActive: true,
      tags: { $regex: query, $options: 'i' }
    }).select('url thumbnailUrl dimensions tags category');
    
    res.json({
      success: true,
      query,
      results: clipart
    });
  } catch (error) {
    console.error('Error searching clipart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching clipart'
    });
  }
});

module.exports = router;
