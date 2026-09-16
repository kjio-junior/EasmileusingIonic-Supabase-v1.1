const { supabaseAdmin } = require('../config/supabase');

async function list(req, res) {
  const { category, q } = req.query;

  let query = supabaseAdmin
    .from('services')
    .select('id, name, description, price, category, duration_minutes, image_url, stock')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error('services.list error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ services: data });
}

async function getOne(req, res) {
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('id, name, description, price, category, duration_minutes, image_url, stock')
    .eq('id', req.params.id)
    .is('deleted_at', null)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('services.getOne error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!data) return res.status(404).json({ error: 'Service not found' });
  res.json({ service: data });
}

module.exports = { list, getOne };