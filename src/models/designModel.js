const mongoose = require('mongoose');

const designElementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'clipart', 'image'],
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  rotation: {
    type: Number,
    default: 0
  },
  layer: {
    type: Number,
    required: true
  },
  view: {
    type: String,
    enum: ['front', 'back', 'left', 'right'],
    required: true
  },
  properties: {
    // For text
    text: String,
    fontFamily: String,
    fontSize: Number,
    fontColor: String,
    fontWeight: String,
    fontStyle: String,
    
    // For images/clipart
    src: String,
    originalWidth: Number,
    originalHeight: Number
  }
});

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shareableId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  accessToken: {
    type: String
  },
  tshirt: {
    style: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  elements: [designElementSchema],
  dimensions: {
    front: { 
      widthInches: { type: Number, default: 0 },
      heightInches: { type: Number, default: 0 }
    },
    back: { 
      widthInches: { type: Number, default: 0 },
      heightInches: { type: Number, default: 0 }
    },
    left: { 
      widthInches: { type: Number, default: 0 },
      heightInches: { type: Number, default: 0 }
    },
    right: { 
      widthInches: { type: Number, default: 0 },
      heightInches: { type: Number, default: 0 }
    }
  },
  previewImages: {
    front: String,
    back: String,
    left: String,
    right: String
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    email: String,
    ipAddress: String,
    userAgent: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
designSchema.pre('save', function(next) {
  this.metadata.updatedAt = Date.now();
  next();
});

// Create indexes for efficient queries
designSchema.index({ 'metadata.email': 1 });
designSchema.index({ isPublic: 1 });
designSchema.index({ expiresAt: 1 });

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
