import mongoose from "mongoose";

const ClientPackSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (client)
    required: true,
  },
  pack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pack", // Reference to the Pack model
    required: true,
  },
  packPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: false,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon", // Reference to the Coupon model
    required: false,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  remainingSessions: {
    type: Number,
    required: true,
  },
  purchaseState: {
    type: String,
    enum: ["completed", "pending", "cancelled"],
    default: "pending",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Method to update isActive status based on remainingSessions and expirationDate
ClientPackSchema.methods.updateActiveStatus = function () {
  const currentDate = new Date();
  if (this.remainingSessions <= 0 || currentDate > this.expirationDate) {
    this.isActive = false;
  }
  return this.save();
};

export default mongoose.models.ClientPack ||
  mongoose.model("ClientPack", ClientPackSchema);
