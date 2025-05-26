const mongoose = require('mongoose');

const tshirtStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  availableColors: [{
    name: {
      type: String,
      required: true
    },
    hex: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  availableSizes: [{
    size: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    additionalCost: {
      type: Number,
      default: 0
    }
  }],
  images: {
    front: {
      type: String,
      required: true
    },
    back: {
      type: String,
      required: true
    },
    left: {
      type: String,
      required: true
    },
    right: {
      type: String,
      required: true
    }
  },
  printableAreas: {
    front: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    back: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    left: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    right: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
tshirtStyleSchema.index({ name: 1 });
tshirtStyleSchema.index({ isActive: 1 });
tshirtStyleSchema.index({ 'availableSizes.size': 1 });

const TShirtStyle = mongoose.model('TShirtStyle', tshirtStyleSchema);

module.exports = TShirtStyle;
