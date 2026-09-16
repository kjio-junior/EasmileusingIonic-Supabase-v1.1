require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const email = 'patient@easmile.com';
  const password = 'password123';

  const { data: existing } = await supabaseAdmin
    .from('users').select('id').eq('email', email).maybeSingle();
  if (existing) { console.log('Patient already exists:', existing.id); return; }

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      first_name: 'Ardee',
      last_name: 'Roxas',
      email,
      password_hash: hash,
      phone: '09171234567',
      role: 'patient',
      is_active: true,
      email_verified: true
    })
    .select('id, email, role').single();

  if (error) { console.error(error); process.exit(1); }
  console.log('Created patient:', data);
}
main().catch(e => { console.error(e); process.exit(1); });