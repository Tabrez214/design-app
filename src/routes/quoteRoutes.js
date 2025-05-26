const express = require('express');
const router = express.Router();
const Design = require('../models/designModel');
const Order = require('../models/orderModel');
const TShirtStyle = require('../models/tshirtStyleModel');
const { generatePrinterChallan } = require('../utils/pdfUtils');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/quote
 * @desc    Calculate quote for a design
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { designId, sizes, options } = req.body;
    
    if (!designId || !sizes) {
      return res.status(400).json({
        success: false,
        message: 'Design ID and sizes are required'
      });
    }
    
    // Find design by shareable ID
    const design = await Design.findOne({ shareableId: designId });
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    // Find t-shirt style
    const tshirtStyle = await TShirtStyle.findOne({ 
      name: design.tshirt.style,
      isActive: true
    });
    
    if (!tshirtStyle) {
      return res.status(404).json({
        success: false,
        message: 'T-shirt style not found'
      });
    }
    
    // Calculate total quantity
    const totalQuantity = Object.values(sizes).reduce((sum, qty) => sum + Number(qty), 0);
    
    if (totalQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total quantity must be greater than 0'
      });
    }
    
    // Calculate base price
    const basePrice = tshirtStyle.basePrice * totalQuantity;
    
    // Calculate additional costs
    const additionalCosts = [];
    
    // Add costs for design elements
    if (options?.hasText) {
      additionalCosts.push({
        description: 'Text printing',
        amount: 100 // Rs 100 for text
      });
    }
    
    if (options?.hasImage) {
      additionalCosts.push({
        description: 'Image printing',
        amount: 100 // Rs 100 for image
      });
    }
    
    if (options?.hasBackDesign) {
      additionalCosts.push({
        description: 'Back design printing',
        amount: 100 // Rs 100 for back design
      });
    }
    
    // Add costs for plus sizes
    let plusSizeCost = 0;
    for (const [size, quantity] of Object.entries(sizes)) {
      const sizeInfo = tshirtStyle.availableSizes.find(s => s.size === size);
      if (sizeInfo && sizeInfo.additionalCost > 0 && Number(quantity) > 0) {
        plusSizeCost += sizeInfo.additionalCost * Number(quantity);
      }
    }
    
    if (plusSizeCost > 0) {
      additionalCosts.push({
        description: 'Plus size surcharge',
        amount: plusSizeCost
      });
    }
    
    // Calculate subtotal
    const additionalCostsTotal = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const subtotal = basePrice + additionalCostsTotal;
    
    // Calculate tax (assuming 18% GST)
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);
    
    // Calculate shipping (flat rate for now)
    const shipping = 100; // Rs 100 for shipping
    
    // Calculate total
    const total = subtotal + tax + shipping;
    
    res.json({
      success: true,
      quote: {
        designId,
        totalQuantity,
        sizes,
        priceBreakdown: {
          basePrice,
          additionalCosts,
          subtotal,
          tax,
          shipping,
          total
        }
      }
    });
  } catch (error) {
    console.error('Error calculating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating quote'
    });
  }
});

/**
 * @route   POST /api/printer-challan
 * @desc    Generate printer challan for an order
 * @access  Private
 */
router.post('/printer-challan', async (req, res) => {
  try {
    const { designId, orderDetails } = req.body;
    
    if (!designId || !orderDetails || !orderDetails.orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Design ID and order details are required'
      });
    }
    
    // Find design by shareable ID
    const design = await Design.findOne({ shareableId: designId });
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    // Generate printer challan PDF
    const challanUrl = await generatePrinterChallan(design, orderDetails);
    
    res.json({
      success: true,
      challanUrl,
      message: 'Printer challan generated successfully'
    });
  } catch (error) {
    console.error('Error generating printer challan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating printer challan'
    });
  }
});

/**
 * @route   POST /api/checkout
 * @desc    Initiate checkout process
 * @access  Public
 */
router.post('/checkout', async (req, res) => {
  try {
    const { designId, sizes, customer, shippingMethod } = req.body;
    
    if (!designId || !sizes || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Design ID, sizes, and customer information are required'
      });
    }
    
    // Find design by shareable ID
    const design = await Design.findOne({ shareableId: designId });
    
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found'
      });
    }
    
    // Calculate quote (reusing logic from quote endpoint)
    // Find t-shirt style
    const tshirtStyle = await TShirtStyle.findOne({ 
      name: design.tshirt.style,
      isActive: true
    });
    
    if (!tshirtStyle) {
      return res.status(404).json({
        success: false,
        message: 'T-shirt style not found'
      });
    }
    
    // Calculate total quantity
    const totalQuantity = Object.values(sizes).reduce((sum, qty) => sum + Number(qty), 0);
    
    if (totalQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total quantity must be greater than 0'
      });
    }
    
    // Calculate base price
    const basePrice = tshirtStyle.basePrice * totalQuantity;
    
    // Calculate additional costs
    const additionalCosts = [];
    
    // Add costs for design elements
    const hasText = design.elements.some(el => el.type === 'text');
    if (hasText) {
      additionalCosts.push({
        description: 'Text printing',
        amount: 100 // Rs 100 for text
      });
    }
    
    const hasImage = design.elements.some(el => el.type === 'image' || el.type === 'clipart');
    if (hasImage) {
      additionalCosts.push({
        description: 'Image printing',
        amount: 100 // Rs 100 for image
      });
    }
    
    const hasBackDesign = design.elements.some(el => el.view === 'back');
    if (hasBackDesign) {
      additionalCosts.push({
        description: 'Back design printing',
        amount: 100 // Rs 100 for back design
      });
    }
    
    // Add costs for plus sizes
    let plusSizeCost = 0;
    for (const [size, quantity] of Object.entries(sizes)) {
      const sizeInfo = tshirtStyle.availableSizes.find(s => s.size === size);
      if (sizeInfo && sizeInfo.additionalCost > 0 && Number(quantity) > 0) {
        plusSizeCost += sizeInfo.additionalCost * Number(quantity);
      }
    }
    
    if (plusSizeCost > 0) {
      additionalCosts.push({
        description: 'Plus size surcharge',
        amount: plusSizeCost
      });
    }
    
    // Calculate subtotal
    const additionalCostsTotal = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const subtotal = basePrice + additionalCostsTotal;
    
    // Calculate tax (assuming 18% GST)
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);
    
    // Calculate shipping based on method
    let shipping = 100; // Default Rs 100 for standard shipping
    if (shippingMethod === 'rush') {
      shipping = 300; // Rs 300 for rush shipping
    }
    
    // Calculate total
    const total = subtotal + tax + shipping;
    
    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Create new order
    const newOrder = new Order({
      orderNumber,
      designId: design._id,
      customer,
      sizes,
      totalQuantity,
      priceBreakdown: {
        basePrice,
        additionalCosts,
        subtotal,
        tax,
        shipping,
        total
      },
      status: 'pending',
      paymentStatus: 'pending',
      metadata: {
        ipAddress: req.ip
      }
    });
    
    // Save order to database
    await newOrder.save();
    
    // Generate printer challan
    const orderDetails = {
      orderNumber,
      sizes
    };
    const challanUrl = await generatePrinterChallan(design, orderDetails);
    
    // Update order with challan URL
    newOrder.printerChallanUrl = challanUrl;
    await newOrder.save();
    
    // In a real app, you would integrate with a payment gateway here
    // For now, we'll just return the order details
    
    res.status(201).json({
      success: true,
      order: {
        orderNumber,
        total,
        paymentUrl: `/payment/${orderNumber}`, // Placeholder for payment gateway URL
        challanUrl
      },
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

module.exports = router;
