const { supabaseAdmin } = require('../config/supabase');

// ---------- PUBLIC ----------

// List reviews for a service (public — no auth required)
async function listForService(req, res) {
  const { serviceId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      id, rating, comment, is_verified, created_at,
      patient:users!reviews_patient_id_fkey ( id, first_name, last_name, profile_image )
    `)
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('reviews.listForService error', error);
    return res.status(500).json({ error: 'Server error', detail: error.message });
  }

  const reviews = data || [];
  const count = reviews.length;
  const average = count
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  // Rating distribution (how many 5s, 4s, etc.)
  const distribution = [1,2,3,4,5].reduce((acc, star) => {
    acc[star] = reviews.filter(r => r.rating === star).length;
    return acc;
  }, {});

  res.json({
    reviews,
    summary: {
      count,
      average: Math.round(average * 10) / 10,
      distribution
    }
  });
}

// ---------- CUSTOMER ----------

// List the current user's own reviews
async function listMine(req, res) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      id, rating, comment, is_verified, created_at,
      service:services ( id, name ),
      appointment:appointments ( id, appointment_date )
    `)
    .eq('patient_id', req.user.sub)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('reviews.listMine error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ reviews: data || [] });
}

// Create a review — only for completed appointments
async function create(req, res) {
  const { appointment_id, rating, comment } = req.body || {};

  if (!appointment_id) {
    return res.status(400).json({ error: 'appointment_id is required' });
  }
  const r = Number(rating);
  if (!r || r < 1 || r > 5) {
    return res.status(400).json({ error: 'Rating must be 1 to 5' });
  }

  // Verify the appointment belongs to this patient and is completed
  const { data: appt, error: apptErr } = await supabaseAdmin
    .from('appointments')
    .select('id, patient_id, status, deleted_at')
    .eq('id', appointment_id)
    .maybeSingle();

  if (apptErr) {
    console.error('reviews.create appt fetch error', apptErr);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!appt || appt.deleted_at) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (appt.patient_id !== req.user.sub) {
    return res.status(403).json({ error: 'You can only review your own appointments' });
  }
  if (appt.status !== 'completed') {
    return res.status(400).json({ error: 'You can only review completed appointments' });
  }

  // Get the service_id from the first line item
  const { data: item } = await supabaseAdmin
    .from('appointment_items')
    .select('service_id')
    .eq('appointment_id', appointment_id)
    .limit(1)
    .maybeSingle();

  if (!item) {
    return res.status(400).json({ error: 'Appointment has no service to review' });
  }

  // Insert the review — unique index prevents duplicates
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      patient_id: req.user.sub,
      appointment_id,
      service_id: item.service_id,
      rating: r,
      comment: (comment || '').trim() || null,
      is_verified: true  // we verified the appointment above
    })
    .select(`
      id, rating, comment, is_verified, created_at,
      service:services ( id, name )
    `)
    .single();

  if (error) {
    // Unique violation = already reviewed
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You already reviewed this appointment' });
    }
    console.error('reviews.create insert error', error);
    return res.status(500).json({ error: 'Server error', detail: error.message });
  }

  res.status(201).json({ review: data });
}

// Delete own review
async function remove(req, res) {
  const { id } = req.params;

  const { data: review, error: fetchErr } = await supabaseAdmin
    .from('reviews')
    .select('id, patient_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) {
    console.error('reviews.remove fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const canDelete =
    req.user.role === 'admin' ||
    review.patient_id === req.user.sub;

  if (!canDelete) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('reviews.remove error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

// ---------- ADMIN ----------

async function listAll(req, res) {
  const { service_id, rating, min_rating } = req.query;

  let query = supabaseAdmin
    .from('reviews')
    .select(`
      id, rating, comment, is_verified, created_at,
      patient:users!reviews_patient_id_fkey ( id, first_name, last_name, email, profile_image ),
      service:services ( id, name ),
      appointment:appointments ( id, appointment_date )
    `)
    .order('created_at', { ascending: false });

  if (service_id) query = query.eq('service_id', service_id);
  if (rating)     query = query.eq('rating', Number(rating));
  if (min_rating) query = query.gte('rating', Number(min_rating));

  const { data, error } = await query;
  if (error) {
    console.error('reviews.listAll error', error);
    return res.status(500).json({ error: 'Server error', detail: error.message });
  }
  res.json({ reviews: data || [] });
}

async function toggleVerify(req, res) {
  const { id } = req.params;
  const { is_verified } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update({ is_verified: !!is_verified })
    .eq('id', id)
    .select('id, rating, comment, is_verified, created_at')
    .single();

  if (error) {
    console.error('reviews.toggleVerify error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ review: data });
}

module.exports = { listForService, listMine, create, remove, listAll, toggleVerify };