const { supabaseAdmin } = require('../config/supabase');
const { notify, notifyClinic } = require('../utils/notify');

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

  // Patient gets a confirmation
  await notify({
    userId: req.user.sub,
    type: 'booking',
    title: 'Booking received',
    message: `Your appointment for ${new Date(appt.appointment_date).toLocaleString('en-PH')} is pending confirmation.`,
    link: '/app/appointments'
  });

  // Admins, staff, and dentists get a heads-up
  await notifyClinic({
    type: 'booking',
    title: 'New booking',
    message: `A new appointment was booked for ${new Date(appt.appointment_date).toLocaleString('en-PH')}.`,
    link: '/ea-admin/appointments'
  });

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

async function payAppointment(req, res) {
  const { id } = req.params;
  const { payment_method, card_number, card_name, expiry, cvc } = req.body || {};

  const method = payment_method || 'card';
  const validMethods = ['card', 'gcash', 'qr', 'cash'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  // Card requires full card fields
  if (method === 'card') {
    if (!card_number || !card_name || !expiry || !cvc) {
      return res.status(400).json({ error: 'All card fields are required' });
    }
    const digits = String(card_number).replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(digits)) {
      return res.status(400).json({ error: 'Invalid card number' });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return res.status(400).json({ error: 'Expiry must be in MM/YY format' });
    }
    const [mm] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) {
      return res.status(400).json({ error: 'Invalid expiry month' });
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({ error: 'Invalid CVC' });
    }
  }

  // Load appointment and verify ownership
  const { data: appt, error: fetchErr } = await supabaseAdmin
    .from('appointments')
    .select('id, patient_id, total_amount, payment_status, appointment_date, deleted_at')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) {
    console.error('payAppointment fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!appt || appt.deleted_at) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  if (appt.patient_id !== req.user.sub) {
    return res.status(403).json({ error: 'You can only pay for your own appointments' });
  }
  if (appt.payment_status === 'paid') {
    return res.status(400).json({ error: 'This appointment is already paid' });
  }

  // Simulate processing delay
  await new Promise(r => setTimeout(r, 900));

  // Generate a fake transaction ID with a method-specific prefix
  const prefix = { card: 'CARD', gcash: 'GC', qr: 'QR', cash: 'CASH' }[method];
  const txId =
    prefix +
    '-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  // Cash at clinic does NOT mark the appointment as paid
  const nextPaymentStatus = method === 'cash' ? 'unpaid' : 'paid';

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('appointments')
    .update({
      payment_status: nextPaymentStatus,
      payment_method: method,
      transaction_id: method === 'cash' ? null : txId,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id, appointment_date, status, notes, treatment_notes,
      total_amount, payment_status, payment_method, transaction_id,
      patient:users!appointments_patient_id_fkey ( id, first_name, last_name, email ),
      items:appointment_items ( id, price, service:services ( id, name ) )
    `)
    .single();

  if (updateErr) {
    console.error('payAppointment update error', updateErr);
    return res.status(500).json({ error: 'Server error' });
  }

  // Notifications — only for actual payments, not cash-at-clinic
  if (method !== 'cash') {
    const methodLabel = { card: 'card', gcash: 'GCash', qr: 'QR code' }[method] || method;

    await notify({
      userId: req.user.sub,
      type: 'status',
      title: 'Payment received',
      message: `We received your ${methodLabel} payment of ₱${Number(appt.total_amount).toFixed(2)}. Transaction ID: ${txId}.`,
      link: '/app/appointments'
    });

    await notifyClinic({
      type: 'status',
      title: 'Payment received',
      message: `A patient paid ₱${Number(appt.total_amount).toFixed(2)} via ${methodLabel} for an appointment on ${new Date(appt.appointment_date).toLocaleString('en-PH')}.`,
      link: '/ea-admin/appointments'
    });
  }

  res.json({
    appointment: updated,
    transaction_id: method === 'cash' ? null : txId,
    method
  });
}

async function getOne(req, res) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, notes, treatment_notes,
      total_amount, payment_status, payment_method, transaction_id,
      patient:users!appointments_patient_id_fkey ( id, first_name, last_name, email, phone ),
      dentist:users!appointments_dentist_id_fkey ( id, first_name, last_name ),
      items:appointment_items ( id, price, service:services ( id, name ) )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('getOne error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!data) return res.status(404).json({ error: 'Appointment not found' });

  // Patients can only see their own
  if (req.user.role === 'patient' && req.user.sub !== data.patient?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ appointment: data });
}

async function reschedule(req, res) {
  const { id } = req.params;
  const { new_date } = req.body || {};

  if (!new_date) return res.status(400).json({ error: 'New date required' });

  const newDate = new Date(new_date);
  if (isNaN(newDate.getTime()) || newDate.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Invalid or past date' });
  }

  const { data: appt, error } = await supabaseAdmin
    .from('appointments')
    .select('id, patient_id, appointment_date, status, reschedule_count, deleted_at')
    .eq('id', id)
    .single();

  if (error || !appt || appt.deleted_at) return res.status(404).json({ error: 'Appointment not found' });
  if (appt.patient_id !== req.user.sub) return res.status(403).json({ error: 'Forbidden' });

  if (!['pending', 'confirmed'].includes(appt.status)) {
    return res.status(400).json({ error: 'Cannot reschedule a ' + appt.status + ' appointment' });
  }

  // 24-hour rule
  const hoursUntil = (new Date(appt.appointment_date).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    return res.status(400).json({ error: 'This appointment is less than 24 hours away. Please contact the clinic to reschedule.' });
  }

  if (appt.reschedule_count >= 2) {
    return res.status(400).json({ error: "You've used both reschedules for this appointment. Please contact the clinic to reschedule." });
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('appointments')
    .update({
      appointment_date: newDate.toISOString(),
      reschedule_count: appt.reschedule_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: 'Server error' });

  res.json({ appointment: updated });
}

module.exports = { myAppointments, book, busySlots, payAppointment, getOne, reschedule };