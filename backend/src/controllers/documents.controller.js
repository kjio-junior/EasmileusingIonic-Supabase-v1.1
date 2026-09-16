const { supabaseAdmin } = require('../config/supabase');

async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user.sub;
  const file = req.file;
  const { appointment_id, category, notes, patient_id } = req.body || {};

  // Determine patient_id based on requester role
  let patientId;
  if (req.user.role === 'patient') {
    patientId = userId;
  } else {
    patientId = patient_id;
    if (!patientId) {
      return res.status(400).json({ error: 'patient_id is required for staff uploads' });
    }
  }

  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf'
  };
  const ext = extMap[file.mimetype] || 'bin';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${patientId}/${safeName}`;

  const { error: uploadErr } = await supabaseAdmin
    .storage
    .from('documents')
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (uploadErr) {
    console.error('documents.upload storage error', uploadErr);
    return res.status(500).json({ error: 'Upload failed' });
  }

  const { data: urlData } = supabaseAdmin
    .storage
    .from('documents')
    .getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert({
      appointment_id: appointment_id || null,
      patient_id: patientId,
      uploader_id: userId,
      filename: file.originalname,
      storage_path: path,
      url: urlData.publicUrl,
      mimetype: file.mimetype,
      size_bytes: file.size,
      category: category || 'other',
      notes: notes || null
    })
    .select('*')
    .single();

  if (error) {
    console.error('documents.upload db error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  res.status(201).json({ document: data });
}

async function listDocuments(req, res) {
  const { appointment_id, patient_id } = req.query;

  let query = supabaseAdmin
    .from('documents')
    .select(`
      *,
      uploader:users!documents_uploader_id_fkey ( id, first_name, last_name, role )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Patients see only their own
  if (req.user.role === 'patient') {
    query = query.eq('patient_id', req.user.sub);
  } else if (patient_id) {
    query = query.eq('patient_id', patient_id);
  }

  if (appointment_id) {
    query = query.eq('appointment_id', appointment_id);
  }

  const { data, error } = await query;
  if (error) {
    console.error('documents.list error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ documents: data });
}

async function deleteDocument(req, res) {
  const { id } = req.params;

  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (fetchErr) {
    console.error('documents.delete fetch error', fetchErr);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // Only admin, dentist, or the original uploader can delete
  const canDelete =
    req.user.role === 'admin' ||
    req.user.role === 'dentist' ||
    req.user.sub === doc.uploader_id;

  if (!canDelete) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { error: updateErr } = await supabaseAdmin
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (updateErr) {
    console.error('documents.delete update error', updateErr);
    return res.status(500).json({ error: 'Server error' });
  }

  // Best-effort storage cleanup
  await supabaseAdmin.storage.from('documents').remove([doc.storage_path]);

  res.json({ ok: true });
}

module.exports = { uploadDocument, listDocuments, deleteDocument };