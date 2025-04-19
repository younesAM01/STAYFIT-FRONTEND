import mongoose from 'mongoose';

const ClientPackSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (client)
    required: true
  },
  pack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack', // Reference to the Pack model
    required: true
  },
  packPrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  },
  remainingSessions: {
    type: Number,
    required: true
  },
  purchaseState: {
    type: String,
    enum: ['completed', 'pending' , 'cancelled'],
    default: 'pending',
    required: true
  },
});

export default mongoose.models.ClientPack || mongoose.model('ClientPack', ClientPackSchema);
