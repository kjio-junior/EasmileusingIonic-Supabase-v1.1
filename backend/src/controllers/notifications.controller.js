const { supabaseAdmin } = require('../config/supabase');

async function listMine(req, res) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('id, type, title, message, link, is_read, created_at')
    .eq('user_id', req.user.sub)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('notifications.listMine error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ notifications: data || [] });
}

async function unreadCount(req, res) {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.user.sub)
    .eq('is_read', false);

  if (error) {
    console.error('notifications.unreadCount error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ count: count || 0 });
}

async function markRead(req, res) {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', req.user.sub);

  if (error) {
    console.error('notifications.markRead error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

async function markAllRead(req, res) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.sub)
    .eq('is_read', false);

  if (error) {
    console.error('notifications.markAllRead error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

async function remove(req, res) {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.sub);

  if (error) {
    console.error('notifications.remove error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

// ---------- ADMIN ----------

async function adminList(req, res) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select(`
      id, type, title, message, link, is_read, created_at,
      user:users!notifications_user_id_fkey ( id, first_name, last_name, email, role )
    `)
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('notifications.adminList error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ notifications: data || [] });
}

async function adminBroadcast(req, res) {
  const { type, title, message, link, audience } = req.body || {};

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  // audience: 'patients' | 'all' | 'staff' | specific role name
  let roleFilter = null;
  if (audience === 'patients')   roleFilter = ['patient'];
  if (audience === 'staff')      roleFilter = ['staff', 'dentist', 'admin'];
  if (audience === 'all')        roleFilter = null;

  let query = supabaseAdmin
    .from('users')
    .select('id')
    .is('deleted_at', null)
    .eq('is_active', true);

  if (roleFilter) query = query.in('role', roleFilter);

  const { data: users, error: fetchErr } = await query;
  if (fetchErr) {
    console.error('notifications.adminBroadcast fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }

  const userIds = (users || []).map(u => u.id);
  if (!userIds.length) {
    return res.status(400).json({ error: 'No users to notify' });
  }

  const rows = userIds.map(uid => ({
    user_id: uid,
    type: type || 'system',
    title: title.trim(),
    message: message.trim(),
    link: link?.trim() || null,
    is_read: false
  }));

  const { error } = await supabaseAdmin.from('notifications').insert(rows);
  if (error) {
    console.error('notifications.adminBroadcast insert error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.json({ ok: true, sent: userIds.length });
}

module.exports = {
  listMine, unreadCount, markRead, markAllRead, remove,
  adminList, adminBroadcast
};