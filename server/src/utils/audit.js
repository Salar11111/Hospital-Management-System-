import { AdminLog } from '../models/AdminLog.js';
const writeAuditLog = async (params) => {
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
    console.warn('Audit log write failed', err);
  }
};
export { writeAuditLog };
