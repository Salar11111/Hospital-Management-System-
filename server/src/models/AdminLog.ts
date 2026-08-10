import mongoose from 'mongoose';

export interface AdminLogFields {
  user: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

const adminLogSchema = new mongoose.Schema<AdminLogFields>(
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
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

adminLogSchema.index({ createdAt: -1 });

export type AdminLog = mongoose.HydratedDocument<AdminLogFields>;

export { adminLogSchema };
export const AdminLog = mongoose.model<AdminLogFields>('AdminLog', adminLogSchema);