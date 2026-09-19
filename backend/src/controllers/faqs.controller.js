const { supabaseAdmin } = require('../config/supabase');

async function listActive(req, res) {
  const { category } = req.query;

  let query = supabaseAdmin
    .from('faqs')
    .select('id, question, answer, category, "order"')
    .eq('is_active', true)
    .order('"order"', { ascending: true });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('faqs.listActive error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ faqs: data || [] });
}

async function listAll(req, res) {
  const { data, error } = await supabaseAdmin
    .from('faqs')
    .select('*')
    .order('"order"', { ascending: true });

  if (error) {
    console.error('faqs.listAll error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ faqs: data || [] });
}

async function create(req, res) {
  const { question, answer, category, order, is_active } = req.body || {};

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .insert({
      question: question.trim(),
      answer: answer.trim(),
      category: category?.trim() || 'general',
      order: Number(order) || 0,
      is_active: is_active !== false
    })
    .select('*')
    .single();

  if (error) {
    console.error('faqs.create error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.status(201).json({ faq: data });
}

async function update(req, res) {
  const { id } = req.params;
  const allowed = ['question','answer','category','order','is_active'];

  const patch = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update' });

  if (patch.question) patch.question = patch.question.trim();
  if (patch.answer) patch.answer = patch.answer.trim();
  if (patch.category) patch.category = patch.category.trim();
  if (patch.order !== undefined) patch.order = Number(patch.order) || 0;
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('faqs.update error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ faq: data });
}

async function remove(req, res) {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('faqs').delete().eq('id', id);
  if (error) {
    console.error('faqs.remove error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

module.exports = { listActive, listAll, create, update, remove };