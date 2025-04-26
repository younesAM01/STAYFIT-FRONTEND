import mongoose from 'mongoose'

const CouponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['expired', 'active'],
    default: 'active'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Add a pre-save middleware to check and update status based on expiry date
CouponSchema.pre('save', function(next) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  }
  next();
});

// Make sure we remove any existing model before creating a new one
mongoose.models = {};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)