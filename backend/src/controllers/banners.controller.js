const { supabaseAdmin } = require('../config/supabase');

// Public: only active banners whose date window (if set) includes now
async function listActive(req, res) {
  const { position } = req.query;
  const now = new Date().toISOString();

  let query = supabaseAdmin
    .from('banners')
    .select('id, title, subtitle, description, image_url, link_url, button_text, position, "order", start_date, end_date')
    .eq('is_active', true)
    .order('"order"', { ascending: true });

  if (position) query = query.eq('position', position);

  const { data, error } = await query;
  if (error) {
    console.error('banners.listActive error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  const banners = (data || []).filter(b => {
    if (b.start_date && new Date(b.start_date) > new Date(now)) return false;
    if (b.end_date && new Date(b.end_date) < new Date(now)) return false;
    return true;
  });

  res.json({ banners });
}

// Admin: everything
async function listAll(req, res) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('"order"', { ascending: true });

  if (error) {
    console.error('banners.listAll error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ banners: data || [] });
}

async function create(req, res) {
  const {
    title, subtitle, description, image_url,
    link_url, button_text, position, order,
    is_active, start_date, end_date
  } = req.body || {};

  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image URL are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert({
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      description: description?.trim() || null,
      image_url: image_url.trim(),
      link_url: link_url?.trim() || null,
      button_text: button_text?.trim() || null,
      position: position || 'hero',
      order: Number(order) || 0,
      is_active: is_active !== false,
      start_date: start_date || null,
      end_date: end_date || null
    })
    .select('*')
    .single();

  if (error) {
    console.error('banners.create error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.status(201).json({ banner: data });
}

async function update(req, res) {
  const { id } = req.params;
  const allowed = [
    'title','subtitle','description','image_url','link_url','button_text',
    'position','order','is_active','start_date','end_date'
  ];

  const patch = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }

  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (patch.title) patch.title = patch.title.trim();
  if (patch.image_url) patch.image_url = patch.image_url.trim();
  if (patch.order !== undefined) patch.order = Number(patch.order) || 0;
  if (patch.position !== undefined && !['hero','featured','sidebar','footer'].includes(patch.position)) {
    return res.status(400).json({ error: 'Invalid position' });
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('banners')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('banners.update error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ banner: data });
}

async function remove(req, res) {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('banners.remove error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

module.exports = { listActive, listAll, create, update, remove };