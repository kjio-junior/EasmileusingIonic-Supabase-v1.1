console.log('=== ENV CHECK ===');
console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SECRET_KEY present:', !!process.env.SUPABASE_SECRET_KEY);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('=================');
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));