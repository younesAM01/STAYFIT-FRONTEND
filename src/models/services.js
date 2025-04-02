import mongoose from 'mongoose'

const ServicesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
  ,
  image: {  // Add this field to match your POST request
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Services || mongoose.model('Services', ServicesSchema)