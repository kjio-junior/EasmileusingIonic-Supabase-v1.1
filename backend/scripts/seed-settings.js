require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

const DEFAULTS = [
  { key: 'clinic_name',        value: '"EAsmile Dental Clinic"', category: 'general',  description: 'Display name of the clinic' },
  { key: 'clinic_email',       value: '"easmile.08@email.com"',  category: 'contact',  description: 'Public contact email' },
  { key: 'clinic_phone',       value: '"+63 123 456 7890"',      category: 'contact',  description: 'Public contact phone' },
  { key: 'clinic_address',     value: '"938 Aurora Blvd, Cubao, Quezon City, Metro Manila"', category: 'contact', description: 'Physical address' },
  { key: 'clinic_hours_weekday', value: '"9:00 AM – 6:00 PM"',   category: 'hours',    description: 'Weekday hours' },
  { key: 'clinic_hours_weekend', value: '"By appointment only"', category: 'hours',    description: 'Weekend hours' },
  { key: 'clinic_tagline',     value: '"Your Dental Care, All in One Place."', category: 'general', description: 'Tagline shown on splash' },
  { key: 'booking_max_days',   value: '90',                      category: 'booking',  description: 'How many days ahead users can book' },
  { key: 'session_timeout_minutes', value: '60',                 category: 'booking',  description: 'Idle timeout for customer sessions' }
];

async function main() {
  for (const s of DEFAULTS) {
    const value = JSON.parse(s.value);
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert(
        { key: s.key, value, category: s.category, description: s.description, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) {
      console.error(`Failed for ${s.key}:`, error.message);
    } else {
      console.log(`✓ ${s.key}`);
    }
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });