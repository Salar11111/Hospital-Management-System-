import mongoose from 'mongoose';

export interface MedicineFields {
  name: string;
  genericName?: string;
  category: string;
  stockQuantity: number;
  price: number;
  expiryDate?: Date;
  supplier?: string;
  reorderLevel: number;
}

const medicineSchema = new mongoose.Schema<MedicineFields>(
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
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export type Medicine = mongoose.HydratedDocument<MedicineFields>;

export { medicineSchema };
export const Medicine = mongoose.model<MedicineFields>('Medicine', medicineSchema);