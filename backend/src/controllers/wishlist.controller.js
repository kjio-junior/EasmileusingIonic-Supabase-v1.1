const { supabaseAdmin } = require('../config/supabase');

async function listMine(req, res) {
  const { data, error } = await supabaseAdmin
    .from('wishlist')
    .select(`
      id, created_at,
      service:services ( id, name, description, price, category, duration_minutes, is_active, deleted_at )
    `)
    .eq('user_id', req.user.sub)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('wishlist.listMine error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  const items = (data || []).filter(w =>
    w.service && w.service.is_active && !w.service.deleted_at
  );

  res.json({ items });
}

async function add(req, res) {
  const { service_id } = req.body || {};
  if (!service_id) return res.status(400).json({ error: 'service_id required' });

  const { data: service } = await supabaseAdmin
    .from('services')
    .select('id, is_active, deleted_at')
    .eq('id', service_id)
    .maybeSingle();

  if (!service || service.deleted_at || !service.is_active) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const { data, error } = await supabaseAdmin
    .from('wishlist')
    .insert({ user_id: req.user.sub, service_id })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.json({ ok: true, already: true });
    }
    console.error('wishlist.add error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.status(201).json({ ok: true, id: data.id });
}

async function remove(req, res) {
  const { serviceId } = req.params;

  const { error } = await supabaseAdmin
    .from('wishlist')
    .delete()
    .eq('user_id', req.user.sub)
    .eq('service_id', serviceId);

  if (error) {
    console.error('wishlist.remove error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

module.exports = { listMine, add, remove };