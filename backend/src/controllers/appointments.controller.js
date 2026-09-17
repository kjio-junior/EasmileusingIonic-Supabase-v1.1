const { supabaseAdmin } = require('../config/supabase');

async function myAppointments(req, res) {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, notes, treatment_notes,
      total_amount, payment_status, created_at,
      dentist:users!appointments_dentist_id_fkey ( id, first_name, last_name ),
      items:appointment_items ( id, price, service:services ( id, name ) )
    `)
    .eq('patient_id', req.user.sub)
    .is('deleted_at', null)
    .order('appointment_date', { ascending: false });

  if (error) {
    console.error('appointments.myAppointments error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ appointments: data });
}

async function book(req, res) {
  const { service_id, appointment_date, notes } = req.body || {};

  if (!service_id || !appointment_date) {
    return res.status(400).json({ error: 'Service and date are required' });
  }

  const date = new Date(appointment_date);
  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Invalid appointment date' });
  }
  if (date.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Appointment must be in the future' });
  }

  const { data, error } = await supabaseAdmin.rpc('book_appointment', {
    p_patient_id: req.user.sub,
    p_service_id: service_id,
    p_appointment_date: date.toISOString(),
    p_notes: notes || null
  });

  if (error) {
    console.error('appointments.book rpc error', error);
    return res.status(400).json({ error: error.message || 'Booking failed' });
  }

  const { data: appt, error: fetchErr } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, notes, total_amount, payment_status,
      dentist:users!appointments_dentist_id_fkey ( id, first_name, last_name )
    `)
    .eq('id', data)
    .single();

  if (fetchErr) {
    console.error('appointments.book fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }

  res.status(201).json({ appointment: appt });
}

async function busySlots(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);
  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('appointment_date, status')
    .gte('appointment_date', start.toISOString())
    .lte('appointment_date', end.toISOString())
    .is('deleted_at', null)
    .in('status', ['pending', 'confirmed', 'in-progress']);

  if (error) {
    console.error('appointments.busySlots error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  const busy = data.map(a => a.appointment_date);
  res.json({ busy });
}

module.exports = { myAppointments, book, busySlots };