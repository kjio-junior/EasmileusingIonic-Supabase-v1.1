const { supabaseAdmin } = require('../config/supabase');

/**
 * Record an audit log entry. Never throws — logging failures
 * should not break the actual request.
 *
 * @param {object} opts
 * @param {string} opts.action      e.g. 'user.create', 'service.update'
 * @param {string} opts.entity      e.g. 'user', 'service', 'appointment'
 * @param {string} [opts.entity_id] UUID of the affected row
 * @param {object} [opts.changes]   JSONB blob with before/after or details
 * @param {object} req              Express request (for IP, user, UA)
 */
async function logAudit({ action, entity, entity_id, changes }, req) {
  try {
    const userId = req?.user?.sub || null;
    const ipAddress = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
                    || req?.ip
                    || null;
    const userAgent = req?.headers?.['user-agent'] || null;

    await supabaseAdmin.from('audit_logs').insert({
      action,
      entity,
      entity_id: entity_id || null,
      changes: changes || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      user_id: userId
    });
  } catch (err) {
    console.error('audit log failed:', err.message);
  }
}

module.exports = { logAudit };