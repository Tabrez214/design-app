const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { ensureDirectoryExists } = require('./imageUtils');
const Design = require('../models/designModel');

/**
 * Calculate design dimensions in inches
 * @param {Object} design - The design document or design data
 * @returns {Object} Dimensions for each view in inches
 */
const calculateDesignDimensions = (design) => {
  const dimensions = {
    front: { widthInches: 0, heightInches: 0 },
    back: { widthInches: 0, heightInches: 0 },
    left: { widthInches: 0, heightInches: 0 },
    right: { widthInches: 0, heightInches: 0 }
  };
  
  // Conversion ratio from pixels to inches (example value)
  const PIXELS_PER_INCH = 72;
  
  // Process each view
  ['front', 'back', 'left', 'right'].forEach(view => {
    // Filter elements for this view
    const viewElements = design.elements.filter(el => el.view === view);
    
    if (viewElements.length === 0) {
      return; // No elements on this view
    }
    
    // Find bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    viewElements.forEach(el => {
      const left = el.position.x;
      const top = el.position.y;
      const right = left + el.size.width;
      const bottom = top + el.size.height;
      
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });
    
    // Convert to inches
    dimensions[view].widthInches = ((maxX - minX) / PIXELS_PER_INCH).toFixed(2);
    dimensions[view].heightInches = ((maxY - minY) / PIXELS_PER_INCH).toFixed(2);
  });
  
  return dimensions;
};

/**
 * Generate a printer challan PDF for an order
 * @param {Object} design - The design document
 * @param {Object} orderDetails - Order details including sizes and quantities
 * @returns {Promise<string>} URL to the generated PDF
 */
const generatePrinterChallan = async (design, orderDetails) => {
  try {
    // Calculate design dimensions if not already calculated
    if (!design.dimensions || !design.dimensions.front.widthInches) {
      design.dimensions = calculateDesignDimensions(design);
      
      // If this is a database document, save the updated dimensions
      if (design.save) {
        await design.save();
      }
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set up file path
    const challanDir = path.join(__dirname, '../../uploads/designs/challans');
    await ensureDirectoryExists(challanDir);
    
    const filePath = path.join(challanDir, `challan-order-${orderDetails.orderNumber}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);
    
    // Add header
    doc.fontSize(20).text('Printer Challan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order Number: ${orderDetails.orderNumber}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add design information
    doc.fontSize(16).text('Design Information');
    doc.moveDown();
    
    // Add design previews
    const previewWidth = 200;
    let yPosition = doc.y;
    
    // Base URL for accessing uploads
    const baseUrl = path.join(__dirname, '../..');
    
    // Front view
    if (design.previewImages && design.previewImages.front) {
      const frontImagePath = path.join(baseUrl, design.previewImages.front.replace(/^\//, ''));
      if (fs.existsSync(frontImagePath)) {
        doc.image(frontImagePath, 50, yPosition, { width: previewWidth });
        doc.fontSize(12).text('Front View', 50, yPosition + previewWidth + 10);
        if (design.dimensions.front.widthInches > 0) {
          doc.text(`Dimensions: ${design.dimensions.front.widthInches}" × ${design.dimensions.front.heightInches}"`);
        } else {
          doc.text('No design elements');
        }
      }
    }
    
    // Back view
    if (design.previewImages && design.previewImages.back) {
      const backImagePath = path.join(baseUrl, design.previewImages.back.replace(/^\//, ''));
      if (fs.existsSync(backImagePath)) {
        doc.image(backImagePath, 300, yPosition, { width: previewWidth });
        doc.fontSize(12).text('Back View', 300, yPosition + previewWidth + 10);
        if (design.dimensions.back.widthInches > 0) {
          doc.text(`Dimensions: ${design.dimensions.back.widthInches}" × ${design.dimensions.back.heightInches}"`);
        } else {
          doc.text('No design elements');
        }
      }
    }
    
    // Move down for next section
    doc.moveDown(previewWidth / 20 + 5);
    
    // Left and right views on next row
    yPosition = doc.y;
    
    // Left view
    if (design.previewImages && design.previewImages.left) {
      const leftImagePath = path.join(baseUrl, design.previewImages.left.replace(/^\//, ''));
      if (fs.existsSync(leftImagePath)) {
        doc.image(leftImagePath, 50, yPosition, { width: previewWidth });
        doc.fontSize(12).text('Left View', 50, yPosition + previewWidth + 10);
        if (design.dimensions.left.widthInches > 0) {
          doc.text(`Dimensions: ${design.dimensions.left.widthInches}" × ${design.dimensions.left.heightInches}"`);
        } else {
          doc.text('No design elements');
        }
      }
    }
    
    // Right view
    if (design.previewImages && design.previewImages.right) {
      const rightImagePath = path.join(baseUrl, design.previewImages.right.replace(/^\//, ''));
      if (fs.existsSync(rightImagePath)) {
        doc.image(rightImagePath, 300, yPosition, { width: previewWidth });
        doc.fontSize(12).text('Right View', 300, yPosition + previewWidth + 10);
        if (design.dimensions.right.widthInches > 0) {
          doc.text(`Dimensions: ${design.dimensions.right.widthInches}" × ${design.dimensions.right.heightInches}"`);
        } else {
          doc.text('No design elements');
        }
      }
    }
    
    // Move down for next section
    doc.moveDown(previewWidth / 20 + 10);
    
    // Add quantity information
    doc.fontSize(16).text('Quantity Information');
    doc.moveDown();
    
    // Create a table for sizes and quantities
    const sizes = Object.keys(orderDetails.sizes);
    const quantities = Object.values(orderDetails.sizes);
    
    // Calculate total quantity
    const totalQuantity = quantities.reduce((sum, qty) => sum + Number(qty), 0);
    
    // Draw table header
    doc.fontSize(12).text('Size', 50, doc.y, { width: 100 });
    doc.text('Quantity', 150, doc.y - 12, { width: 100 });
    doc.moveDown();
    
    // Draw horizontal line
    doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Draw table rows
    sizes.forEach((size, index) => {
      const quantity = quantities[index];
      if (quantity > 0) {
        doc.text(size, 50, doc.y, { width: 100 });
        doc.text(quantity.toString(), 150, doc.y - 12, { width: 100 });
        doc.moveDown();
      }
    });
    
    // Draw horizontal line
    doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Add total
    doc.text('Total', 50, doc.y, { width: 100 });
    doc.text(totalQuantity.toString(), 150, doc.y - 12, { width: 100 });
    
    // Add footer
    doc.moveDown(4);
    doc.fontSize(10).text('This challan is for printing purposes only.', { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
    // Return promise that resolves when PDF is written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve(`/uploads/designs/challans/challan-order-${orderDetails.orderNumber}.pdf`);
      });
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating printer challan:', error);
    throw error;
  }
};

module.exports = {
  calculateDesignDimensions,
  generatePrinterChallan
};
