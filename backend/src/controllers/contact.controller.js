const { supabaseAdmin } = require('../config/supabase');

async function submit(req, res) {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const userId = req.user?.sub || null;

  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
      user_id: userId
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('contact.submit error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.status(201).json({ ok: true, id: data.id });
}

module.exports = { submit };