const { supabaseAdmin } = require('../config/supabase');
const { logAudit } = require('../utils/audit');

// List services with stock info, sorted low-stock-first
async function listInventory(req, res) {
  const { low_only } = req.query;

  let query = supabaseAdmin
    .from('services')
    .select('id, name, category, stock, low_stock_threshold, is_active, updated_at')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('inventory.list error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  let items = (data || []).map(s => ({
    ...s,
    is_low: s.stock <= s.low_stock_threshold
  }));

  if (low_only === 'true') {
    items = items.filter(i => i.is_low);
  }

  // Low stock first, then alphabetical
  items.sort((a, b) => {
    if (a.is_low !== b.is_low) return a.is_low ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  res.json({ items });
}

// Get inventory history for a service
async function getHistory(req, res) {
  const { serviceId } = req.params;

  const { data: logs, error } = await supabaseAdmin
    .from('inventory_logs')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('inventory.history error', error);
    return res.status(500).json({ error: 'Server error', detail: error.message });
  }

  if (!logs || !logs.length) {
    return res.json({ history: [] });
  }

  // Fetch the performer info separately — no FK alias dependency
  const userIds = [...new Set(logs.map(l => l.performed_by).filter(Boolean))];
  let usersMap = {};

  if (userIds.length) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name')
      .in('id', userIds);

    usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));
  }

  const history = logs.map(l => ({
    ...l,
    performed_by_user: l.performed_by ? (usersMap[l.performed_by] || null) : null
  }));

  res.json({ history });
}

// Update stock for a single service
async function updateStock(req, res) {
  const { serviceId } = req.params;
  const { new_stock, reason, notes } = req.body || {};

  if (new_stock == null || isNaN(Number(new_stock))) {
    return res.status(400).json({ error: 'new_stock must be a number' });
  }
  const targetStock = Number(new_stock);
  if (targetStock < 0) {
    return res.status(400).json({ error: 'Stock cannot be negative' });
  }

  // Fetch current state
  const { data: service, error: fetchErr } = await supabaseAdmin
    .from('services')
    .select('id, name, stock, low_stock_threshold')
    .eq('id', serviceId)
    .is('deleted_at', null)
    .maybeSingle();

  if (fetchErr) {
    console.error('inventory.updateStock fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const previousStock = service.stock;
  const changeAmount = targetStock - previousStock;

  // Update the service stock
  const { error: updateErr } = await supabaseAdmin
    .from('services')
    .update({
      stock: targetStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', serviceId);

  if (updateErr) {
    console.error('inventory.updateStock update error', updateErr);
    return res.status(500).json({ error: 'Server error' });
  }

  // Log the change
  const { error: logErr } = await supabaseAdmin
    .from('inventory_logs')
    .insert({
      service_id: serviceId,
      previous_stock: previousStock,
      new_stock: targetStock,
      change_amount: changeAmount,
      reason: reason || 'manual_adjustment',
      notes: notes || null,
      performed_by: req.user.sub
    });

  if (logErr) {
    console.error('inventory.updateStock log error:', logErr.message, logErr.details, logErr.code);
  }

  await logAudit({
    action: 'inventory.stock_change',
    entity: 'service',
    entity_id: serviceId,
    changes: { previous_stock: previousStock, new_stock: targetStock, reason: reason || 'manual_adjustment' }
  }, req);

  res.json({
    item: {
      id: service.id,
      name: service.name,
      stock: targetStock,
      low_stock_threshold: service.low_stock_threshold,
      is_low: targetStock <= service.low_stock_threshold
    },
    change: changeAmount
  });
}

// Bulk update multiple services at once
async function bulkUpdate(req, res) {
  const { updates } = req.body || {};

  if (!Array.isArray(updates) || !updates.length) {
    return res.status(400).json({ error: 'updates array required' });
  }

  const results = [];

  for (const u of updates) {
    if (!u.service_id || u.new_stock == null) continue;

    const { data: service } = await supabaseAdmin
      .from('services')
      .select('id, stock')
      .eq('id', u.service_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!service) continue;

    const previousStock = service.stock;
    const targetStock = Number(u.new_stock);
    if (targetStock < 0) continue;

    await supabaseAdmin
      .from('services')
      .update({ stock: targetStock, updated_at: new Date().toISOString() })
      .eq('id', u.service_id);

    await supabaseAdmin
      .from('inventory_logs')
      .insert({
        service_id: u.service_id,
        previous_stock: previousStock,
        new_stock: targetStock,
        change_amount: targetStock - previousStock,
        reason: u.reason || 'bulk_adjustment',
        notes: u.notes || null,
        performed_by: req.user.sub
      });

    results.push({ service_id: u.service_id, new_stock: targetStock });
  }

  res.json({ updated: results.length, results });
}

module.exports = { listInventory, getHistory, updateStock, bulkUpdate };