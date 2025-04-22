import mongoose from 'mongoose';

const PackSchema = new mongoose.Schema({
  startPrice: {
    type: Number,
    required: true
  },
  category: {
    en: {
      type: String,
      required: true
    },
    ar: {
      type: String,
      required: true
    }
  },
  sessions: [
    {
      price: {
        type: Number,
        required: true
      },
      sessionCount: {
        type: Number,
        required: true
      },
      expirationDays: {
        type: Number,
        required: true
      }
    }
  ],
  features: {
    en: {
      type: [String],
      required: true
    },
    ar: {
      type: [String],
      required: true
    }
  }
});

export default mongoose.models.Pack || mongoose.model('Pack', PackSchema);
