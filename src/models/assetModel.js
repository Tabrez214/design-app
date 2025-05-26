const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['clipart', 'uploaded'],
    required: true
  },
  category: {
    type: String,
    required: function() {
      return this.type === 'clipart';
    }
  },
  tags: [String],
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: String,
    originalFilename: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
assetSchema.index({ type: 1, category: 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ isActive: 1 });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
