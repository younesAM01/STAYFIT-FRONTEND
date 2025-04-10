import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    ar: {
      type: String,
      required: false,
      trim: true,
      default: ""
    }
  },
  trainerName: {
    en: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    ar: {
      type: String,
      required: false,
      trim: true,
      default: ""
    }
  },
  quote: {
    en: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    ar: {
      type: String,
      required: false,
      trim: true,
      default: ""
    }
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Make sure we remove any existing model before creating a new one (helps with hot reloading issues)
mongoose.models = {};

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)