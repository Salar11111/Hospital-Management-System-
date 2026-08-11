import mongoose from 'mongoose';
const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Medicine name is required'], trim: true, unique: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true, default: 'General' },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0, default: 0 },
    expiryDate: { type: Date },
    supplier: { type: String, trim: true },
    reorderLevel: { type: Number, default: 10, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);
const Medicine = mongoose.model('Medicine', medicineSchema);
export { Medicine, medicineSchema };
