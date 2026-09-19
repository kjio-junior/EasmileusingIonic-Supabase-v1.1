const { supabaseAdmin } = require('../config/supabase');

async function notify({ userId, type, title, message, link }) {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type: type || 'system',
      title,
      message,
      link: link || null,
      is_read: false
    });
  } catch (err) {
    console.error('notify failed:', err.message);
  }
}

async function notifyMany({ userIds, type, title, message, link }) {
  if (!userIds?.length) return;
  try {
    const rows = userIds.map(uid => ({
      user_id: uid,
      type: type || 'system',
      title,
      message,
      link: link || null,
      is_read: false
    }));
    await supabaseAdmin.from('notifications').insert(rows);
  } catch (err) {
    console.error('notifyMany failed:', err.message);
  }
}

/**
 * Notify all active admins, staff, and dentists.
 */
async function notifyClinic({ type, title, message, link }) {
  try {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .in('role', ['admin', 'staff', 'dentist'])
      .eq('is_active', true)
      .is('deleted_at', null);

    const ids = (users || []).map(u => u.id);
    if (!ids.length) return;
    await notifyMany({ userIds: ids, type, title, message, link });
  } catch (err) {
    console.error('notifyClinic failed:', err.message);
  }
}

module.exports = { notify, notifyMany, notifyClinic };