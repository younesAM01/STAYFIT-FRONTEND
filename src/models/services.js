import mongoose from 'mongoose'

const ServicesSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: false,
      default: ""
    },
    ar: {
      type: String,
      required: false,
      default: ""
    }
  },
  description: {
    en: {
      type: String,
      required: false,
      default: ""
    },
    ar: {
      type: String,
      required: false,
      default: ""
    }
  },
  image: {  // Add this field to match your POST request
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Make sure we remove any existing model before creating a new one
mongoose.models = {};

export default mongoose.models.Services || mongoose.model('Services', ServicesSchema)