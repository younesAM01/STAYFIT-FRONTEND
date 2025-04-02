import mongoose from 'mongoose'

const PacksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true

  },
  price: {
    type: Number,
    required: true

  }
  ,
  description: {
    type: [String],    // Array of strings for bullet points
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;  // Ensures it's a non-empty array
      },
      message: 'Description must have at least one bullet point'
    },
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Packs || mongoose.model('Packs', PacksSchema)