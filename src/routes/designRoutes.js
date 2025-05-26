const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Design = require('../models/designModel');
const { generatePreviewImages } = require('../utils/imageUtils');
const { sendDesignEmail } = require('../utils/emailUtils');
const { calculateDesignDimensions } = require('../utils/designUtils');

/**
 * @route   POST /api/designs
 * @desc    Save a new design
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { design, email } = req.body;
    
    if (!design || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Design data and email are required' 
      });
    }

    // Generate a unique shareable ID
    const shareableId = uuidv4();
    
    // Create JWT token for secure access (for private designs)
    const accessToken = jwt.sign(
      { designId: shareableId, email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Calculate design dimensions for printer challan
    const dimensions = calculateDesignDimensions(design);

    // Create new design document
    const newDesign = new Design({
      name: design.name || 'Untitled Design',
      shareableId,
      accessToken,
      tshirt: design.tshirt,
      elements: design.elements,
      dimensions,
      isPublic: design.isPublic || false,
      metadata: {
        email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    // Save design to database
    await newDesign.save();

    // Generate preview images
    const previewImages = await generatePreviewImages(newDesign);
    
    // Update design with preview image URLs
    newDesign.previewImages = previewImages;
    await newDesign.save();

    // Send email with design preview
    await sendDesignEmail(newDesign._id, email);

    // Generate response with links
    const privateLink = `${process.env.FRONTEND_URL}/design/${shareableId}?token=${accessToken}`;
    const publicLink = newDesign.isPublic ? `${process.env.FRONTEND_URL}/share/${shareableId}` : null;

    res.status(201).json({
      success: true,
      designId: shareableId,
      shareableLink: privateLink,
      publicLink,
      message: 'Design saved successfully'
    });
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving design' 
    });
  }
});

/**
 * @route   GET /api/designs/:id
 * @desc    Get design by ID
 * @access  Public/Private (depending on isPublic flag)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    // Find design by shareable ID
    const design = await Design.findOne({ shareableId: id });

    if (!design) {
      return res.status(404).json({ 
        success: false, 
        message: 'Design not found' 
      });
    }

    // Check if design is public or token is valid
    if (!design.isPublic) {
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication token is required for private designs' 
        });
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is for this design
        if (decoded.designId !== id) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid token for this design' 
          });
        }
      } catch (error) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
    }

    res.json({
      success: true,
      design: {
        id: design.shareableId,
        name: design.name,
        tshirt: design.tshirt,
        elements: design.elements,
        currentView: 'front', // Default view
        previewImages: design.previewImages,
        isPublic: design.isPublic
      }
    });
  } catch (error) {
    console.error('Error retrieving design:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while retrieving design' 
    });
  }
});

/**
 * @route   PUT /api/designs/:id
 * @desc    Update design by ID
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const { design } = req.body;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token is required' 
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is for this design
      if (decoded.designId !== id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token for this design' 
        });
      }
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Find design by shareable ID
    const existingDesign = await Design.findOne({ shareableId: id });

    if (!existingDesign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Design not found' 
      });
    }

    // Calculate updated design dimensions
    const dimensions = calculateDesignDimensions(design);

    // Update design fields
    existingDesign.name = design.name || existingDesign.name;
    existingDesign.tshirt = design.tshirt || existingDesign.tshirt;
    existingDesign.elements = design.elements || existingDesign.elements;
    existingDesign.dimensions = dimensions;
    existingDesign.isPublic = design.isPublic !== undefined ? design.isPublic : existingDesign.isPublic;
    existingDesign.metadata.updatedAt = Date.now();

    // Save updated design
    await existingDesign.save();

    // Generate new preview images if elements changed
    if (design.elements) {
      const previewImages = await generatePreviewImages(existingDesign);
      existingDesign.previewImages = previewImages;
      await existingDesign.save();
    }

    res.json({
      success: true,
      message: 'Design updated successfully',
      design: {
        id: existingDesign.shareableId,
        name: existingDesign.name,
        tshirt: existingDesign.tshirt,
        elements: existingDesign.elements,
        previewImages: existingDesign.previewImages,
        isPublic: existingDesign.isPublic
      }
    });
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating design' 
    });
  }
});

/**
 * @route   POST /api/designs/:id/email
 * @desc    Send design email
 * @access  Public
 */
router.post('/:id/email', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find design by shareable ID
    const design = await Design.findOne({ shareableId: id });

    if (!design) {
      return res.status(404).json({ 
        success: false, 
        message: 'Design not found' 
      });
    }

    // Send email with design preview
    await sendDesignEmail(design._id, email, message);

    res.json({
      success: true,
      message: 'Design email sent successfully'
    });
  } catch (error) {
    console.error('Error sending design email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending design email' 
    });
  }
});

module.exports = router;
