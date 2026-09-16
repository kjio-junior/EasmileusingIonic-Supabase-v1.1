require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const email = 'superadmin@easmile.com';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log('Admin already exists:', existing.id);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      first_name: 'Super',
      last_name: 'Admin',
      email,
      password_hash: hash,
      phone: '0000000000',
      role: 'admin',
      is_active: true,
      email_verified: true
    })
    .select('id, email, role')
    .single();

  if (error) { console.error(error); process.exit(1); }
  console.log('Created admin:', data);
}

main().catch((e) => { console.error(e); process.exit(1); });