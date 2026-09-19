require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const servicesRoutes = require('./routes/services.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const adminRoutes = require('./routes/admin.routes');
const pdfRoutes = require('./routes/pdf.routes');
const documentsRoutes = require('./routes/documents.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const contactRoutes = require('./routes/contact.routes');
const bannersRoutes = require('./routes/banners.routes');
const faqsRoutes = require('./routes/faqs.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', pdfRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/faqs', faqsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;