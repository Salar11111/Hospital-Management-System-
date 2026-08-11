import mongoose from 'mongoose';
const adminLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
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
adminLogSchema.index({ createdAt: -1 });
const AdminLog = mongoose.model('AdminLog', adminLogSchema);
export { AdminLog, adminLogSchema };
