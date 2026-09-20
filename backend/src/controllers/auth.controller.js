const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const { signAccess, signRefresh } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, password_hash, role, is_active, deleted_at')
    .eq('email', String(email).toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error('login lookup error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  // Same message for "no user" and "bad password" — don't leak which.
  if (!user || user.deleted_at || !user.is_active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await supabaseAdmin
    .from('users')
    .update({
      refresh_token: refreshToken,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, accessToken, refreshToken });
}

async function register(req, res) {
  const { first_name, last_name, email, phone, password } = req.body || {};

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const cleanEmail = String(email).toLowerCase().trim();

  // Check for existing user
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
      role: 'patient',
      is_active: true,
      email_verified: false
    })
    .select('id, first_name, last_name, email, phone, role, is_active')
    .single();

  if (error) {
    console.error('register error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await supabaseAdmin
    .from('users')
    .update({ refresh_token: refreshToken, last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  return res.status(201).json({ user, accessToken, refreshToken });
}

async function adminLogin(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, password_hash, role, is_active, deleted_at')
    .eq('email', String(email).toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error('adminLogin lookup error', error);
    return res.status(500).json({ error: 'Server error' });
  }

  if (!user || user.deleted_at || !user.is_active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const portalRoles = ['admin', 'dentist', 'staff'];
  if (!portalRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Not a staff or administrator account' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await supabaseAdmin
    .from('users')
    .update({
      refresh_token: refreshToken,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, accessToken, refreshToken });
}

async function getProfile(req, res) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, address, role, profile_image, email_verified, last_login_at, created_at')
    .eq('id', req.user.sub)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('getProfile error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!data) return res.status(404).json({ error: 'User not found' });
  res.json({ user: data });
}

async function updateProfile(req, res) {
  const allowed = ['first_name', 'last_name', 'phone', 'address', 'profile_image'];
  const patch = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(patch)
    .eq('id', req.user.sub)
    .select('id, first_name, last_name, email, phone, address, role, profile_image')
    .single();

  if (error) {
    console.error('updateProfile error', error);
    return res.status(500).json({ error: 'Server error' });
  }
  res.json({ user: data });
}

async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user.sub;
  const file = req.file;

  const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const ext = extMap[file.mimetype] || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabaseAdmin
    .storage
    .from('avatars')
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadErr) {
    console.error('avatar upload error', uploadErr);
    return res.status(500).json({ error: 'Upload failed' });
  }

  const { data: urlData } = supabaseAdmin
    .storage
    .from('avatars')
    .getPublicUrl(path);

  const { data: user, error: updateErr } = await supabaseAdmin
    .from('users')
    .update({
      profile_image: urlData.publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('id, first_name, last_name, email, phone, address, role, profile_image')
    .single();

  if (updateErr) {
    console.error('avatar update error', updateErr);
    return res.status(500).json({ error: 'Update failed' });
  }

  res.json({ user });
}

async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  const genericMessage = 'If an account exists, a reset link has been sent.';

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, first_name, email')
    .eq('email', String(email).toLowerCase().trim())
    .is('deleted_at', null)
    .maybeSingle();

  // Always return the same message whether or not the user exists (prevents enumeration)
  if (!user) return res.json({ message: genericMessage });

  // Generate a secure, single-use token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await supabaseAdmin.from('password_resets').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString()
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.first_name, resetUrl);
  } catch {
    // Swallow — don't leak whether email exists
  }

  res.json({ message: genericMessage });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: reset } = await supabaseAdmin
    .from('password_resets')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!reset || reset.used_at || new Date(reset.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await supabaseAdmin
    .from('users')
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq('id', reset.user_id);

  await supabaseAdmin
    .from('password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('id', reset.id);

  res.json({ message: 'Password updated successfully' });
}

module.exports = {
  login, register, adminLogin,
  getProfile, updateProfile, uploadAvatar,
  forgotPassword, resetPassword
};