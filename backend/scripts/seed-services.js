require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

const services = [
  { name: 'Check Up',        description: 'Regular dental check up for a healthy smile.',        price: 500,  category: 'diagnostic',   duration_minutes: 30 },
  { name: 'Cleaning',        description: 'Professional cleaning for cleaner, fresher teeth.',   price: 800,  category: 'preventive',   duration_minutes: 45 },
  { name: 'Whitening',       description: 'Safe whitening treatments to brighten your smile.',   price: 2500, category: 'cosmetic',     duration_minutes: 60 },
  { name: 'Fillings',        description: 'Restore cavities with safe, durable fillings.',       price: 1200, category: 'restorative',  duration_minutes: 45 },
  { name: 'Tooth Extraction',description: 'Safe removal of damaged or decayed teeth.',            price: 1500, category: 'surgical',     duration_minutes: 45 },
  { name: 'Orthodontics',    description: 'Braces and aligners for a straighter smile.',         price: 3000, category: 'restorative',  duration_minutes: 60 },
  { name: 'Other Services',  description: 'Other dental treatments and services we offer.',      price: 500,  category: 'diagnostic',   duration_minutes: 30 }
];

async function main() {
  const { data: existing } = await supabaseAdmin.from('services').select('id').limit(1);
  if (existing && existing.length) {
    console.log('Services already seeded. Skipping.');
    return;
  }
  const { data, error } = await supabaseAdmin
    .from('services')
    .insert(services)
    .select('id, name');
  if (error) { console.error(error); process.exit(1); }
  console.log(`Seeded ${data.length} services:`);
  data.forEach(s => console.log('  -', s.name));
}

main().catch(e => { console.error(e); process.exit(1); });