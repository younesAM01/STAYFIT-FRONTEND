import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  trainerName: {
    type: String,
    required: true,
    trim: true,
  },
  quote: {
    type: String,
    required: true,
    trim: true,
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
})

export default mongoose.models.Review|| mongoose.model('Review', ReviewSchema)