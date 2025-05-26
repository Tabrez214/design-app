const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  customer: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  sizes: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    "2XL": { type: Number, default: 0 },
    "3XL": { type: Number, default: 0 },
    "4XL": { type: Number, default: 0 },
    "5XL": { type: Number, default: 0 }
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  priceBreakdown: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCosts: [{
      description: String,
      amount: Number
    }],
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  printerChallanUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
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
    ipAddress: String
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
orderSchema.pre('save', function(next) {
  this.metadata.updatedAt = Date.now();
  next();
});

// Create indexes for efficient queries
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'metadata.createdAt': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
