import type { Request } from 'express';
import { AdminLog } from '../models/AdminLog.js';

export const writeAuditLog = async (params: {
  req: Request;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> => {
  if (!params.req.user) return;
  try {
    await AdminLog.create({
      user: params.req.user._id,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      meta: params.meta,
      ip: params.req.ip,
    });
  } catch (err) {
    // Audit logging must never break the request flow.
    console.warn('Audit log write failed', err);
  }
};