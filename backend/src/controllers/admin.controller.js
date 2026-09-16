const { supabaseAdmin } = require('../config/supabase');

async function dashboard(req, res) {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

  const [
    patientsRes,
    appointmentsRes,
    todayRes,
    pendingRes,
    revenueRes,
    recentRes
  ] = await Promise.all([
    supabaseAdmin.from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient')
      .is('deleted_at', null),

    supabaseAdmin.from('appointments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),

    supabaseAdmin.from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString())
      .is('deleted_at', null),

    supabaseAdmin.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null),

    supabaseAdmin.from('appointments')
      .select('total_amount')
      .eq('status', 'completed')
      .is('deleted_at', null),

    supabaseAdmin.from('appointments')
      .select(`
        id, appointment_date, status, total_amount,
        patient:users!appointments_patient_id_fkey ( id, first_name, last_name )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const totalRevenue = (revenueRes.data || [])
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  res.json({
    stats: {
      total_patients: patientsRes.count || 0,
      total_appointments: appointmentsRes.count || 0,
      today_appointments: todayRes.count || 0,
      pending_appointments: pendingRes.count || 0,
      total_revenue: totalRevenue
    },
    recent_appointments: recentRes.data || []
  });
}

async function listUsers(req, res) {
  const { role, q } = req.query;

  let query = supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at, last_login_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);
  if (q) {
    const term = `%${q}%`;
    query = query.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('admin.listUsers error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ users: data });
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { role, is_active } = req.body || {};

  const patch = {};

  if (role !== undefined) {
    if (!['admin', 'dentist', 'staff', 'patient', 'guest'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    patch.role = role;
  }

  if (is_active !== undefined) {
    patch.is_active = !!is_active;
  }

  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  // Prevent an admin from deactivating their own account
  if (id === req.user.sub && patch.is_active === false) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(patch)
    .eq('id', id)
    .select('id, first_name, last_name, email, phone, role, is_active')
    .single();

  if (error) {
    console.error('admin.updateUser error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.json({ user: data });
}

async function listAppointments(req, res) {
  const { status, date } = req.query;

  let query = supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, notes, total_amount, payment_status,
      created_at,
      patient:users!appointments_patient_id_fkey ( id, first_name, last_name, email, phone ),
      dentist:users!appointments_dentist_id_fkey ( id, first_name, last_name ),
      items:appointment_items ( id, service_id, price, service:services ( id, name ) )
    `)
    .is('deleted_at', null)
    .order('appointment_date', { ascending: false });

  if (status) query = query.eq('status', status);

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    if (!isNaN(start.getTime())) {
      query = query
        .gte('appointment_date', start.toISOString())
        .lte('appointment_date', end.toISOString());
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('admin.listAppointments error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ appointments: data });
}

async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  const allowed = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      id, appointment_date, status, notes, total_amount, payment_status,
      patient:users!appointments_patient_id_fkey ( id, first_name, last_name, email, phone )
    `)
    .single();

  if (error) {
    console.error('admin.updateAppointmentStatus error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ appointment: data });
}

// ---------- SERVICES ----------

async function listServices(req, res) {
  const { category, q } = req.query;

  let query = supabaseAdmin
    .from('services')
    .select('id, name, description, price, category, duration_minutes, image_url, stock, low_stock_threshold, is_active, created_at, updated_at')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error('admin.listServices error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ services: data });
}

async function createService(req, res) {
  const {
    name, description, price, category, duration_minutes,
    image_url, stock, low_stock_threshold
  } = req.body || {};

  if (!name || !description || price == null || !category) {
    return res.status(400).json({ error: 'Name, description, price and category are required' });
  }

  const validCategories = ['preventive', 'restorative', 'cosmetic', 'surgical', 'diagnostic'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const { data, error } = await supabaseAdmin
    .from('services')
    .insert({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numericPrice,
      category,
      duration_minutes: duration_minutes != null ? Number(duration_minutes) : 30,
      image_url: image_url || null,
      stock: stock != null ? Number(stock) : 0,
      low_stock_threshold: low_stock_threshold != null ? Number(low_stock_threshold) : 5,
      is_active: true
    })
    .select('*')
    .single();

  if (error) {
    console.error('admin.createService error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.status(201).json({ service: data });
}

async function updateService(req, res) {
  const { id } = req.params;
  const allowed = ['name', 'description', 'price', 'category', 'duration_minutes', 'image_url', 'stock', 'low_stock_threshold', 'is_active'];
  const patch = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }

  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update' });

  const validCategories = ['preventive', 'restorative', 'cosmetic', 'surgical', 'diagnostic'];
  if (patch.category !== undefined && !validCategories.includes(patch.category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (patch.price !== undefined) {
    patch.price = Number(patch.price);
    if (isNaN(patch.price) || patch.price < 0) return res.status(400).json({ error: 'Invalid price' });
  }
  if (patch.name !== undefined) patch.name = String(patch.name).trim();
  if (patch.description !== undefined) patch.description = String(patch.description).trim();
  if (patch.duration_minutes !== undefined) patch.duration_minutes = Number(patch.duration_minutes);
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin.from('services').update(patch).eq('id', id).is('deleted_at', null).select('*').single();
  if (error) {
    console.error('admin.updateService error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ service: data });
}

async function deleteService(req, res) {
  const { id } = req.params;
  const timestamp = new Date().toISOString();
  const { error } = await supabaseAdmin.from('services').update({ deleted_at: timestamp, is_active: false, updated_at: timestamp }).eq('id', id);
  if (error) {
    console.error('admin.deleteService error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ ok: true });
}

async function reportsSummary(req, res) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: appts, error: apptErr } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, total_amount, created_at,
      items:appointment_items (
        id, price, service:services ( id, name )
      )
    `)
    .is('deleted_at', null)
    .gte('appointment_date', ninetyDaysAgo.toISOString());

  if (apptErr) {
    console.error('reports.appointments error', apptErr);
    return res.status(500).json({ error: 'Server error' });
  }

  const { count: totalPatients } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')
    .is('deleted_at', null);

  const appointments = appts || [];
  const completed = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completed.reduce((sum, a) => sum + Number(a.total_amount || 0), 0);
  const statusCounts = {};
  for (const a of appointments) statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;

  const byDay = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    byDay[d.toISOString().slice(0, 10)] = { revenue: 0, count: 0 };
  }
  for (const a of appointments) {
    const day = byDay[String(a.appointment_date).slice(0, 10)];
    if (!day) continue;
    if (a.status === 'completed') day.revenue += Number(a.total_amount || 0);
    day.count += 1;
  }

  const serviceCounts = {};
  for (const a of appointments) {
    for (const item of a.items || []) {
      const name = item.service?.name || 'Unknown';
      if (!serviceCounts[name]) serviceCounts[name] = { name, count: 0, revenue: 0 };
      serviceCounts[name].count += 1;
      serviceCounts[name].revenue += Number(item.price || 0);
    }
  }

  res.json({
    stats: {
      total_revenue: totalRevenue,
      completed_count: completed.length,
      total_appointments: appointments.length,
      avg_ticket: completed.length ? totalRevenue / completed.length : 0,
      total_patients: totalPatients || 0
    },
    status_counts: statusCounts,
    revenue_by_day: Object.entries(byDay).map(([date, value]) => ({ date, ...value })),
    top_services: Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 5)
  });
}

// ---------- SETTINGS ----------

async function listSettings(req, res) {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true });

  if (error) {
    console.error('admin.listSettings error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ settings: data });
}

async function upsertSetting(req, res) {
  const { key } = req.params;
  const { value } = req.body || {};

  if (!key) return res.status(400).json({ error: 'Key required' });
  if (value === undefined) return res.status(400).json({ error: 'Value required' });

  const { data, error } = await supabaseAdmin
    .from('settings')
    .upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    )
    .select('*')
    .single();

  if (error) {
    console.error('admin.upsertSetting error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ setting: data });
}

async function createUser(req, res) {
  const { first_name, last_name, email, phone, password, role } = req.body || {};

  if (!first_name || !last_name || !email || !phone || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const validRoles = ['admin', 'dentist', 'staff', 'patient', 'guest'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const bcrypt = require('bcryptjs');
  const cleanEmail = String(email).toLowerCase().trim();

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password_hash: hash,
      role,
      is_active: true,
      email_verified: false
    })
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .single();

  if (error) {
    console.error('admin.createUser error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.status(201).json({ user });
}

module.exports = {
  dashboard,
  listUsers,
  updateUser,
  createUser,
  listAppointments,
  updateAppointmentStatus,
  listServices,
  createService,
  updateService,
  deleteService,
  reportsSummary,
  listSettings,
  upsertSetting
};