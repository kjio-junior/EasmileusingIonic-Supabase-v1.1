const PDFDocument = require('pdfkit');
const { supabaseAdmin } = require('../config/supabase');

async function appointmentPdf(req, res) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, appointment_date, status, notes, total_amount, payment_status,
      patient:users!appointments_patient_id_fkey ( id, first_name, last_name, email, phone, address ),
      dentist:users!appointments_dentist_id_fkey ( id, first_name, last_name ),
      items:appointment_items ( id, price, service:services ( name ) )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (req.user.role === 'patient' && req.user.sub !== data.patient?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const buffer = await generatePdf(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename="appointment-${id}.pdf"`);
    res.end(buffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF', detail: String(err.message || err) });
  }
}

function generatePdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ============ HEADER ============
      doc.fontSize(22).fillColor('#0A1E29').text('EAsmile Dental Clinic');
      doc.fontSize(10).fillColor('#7a8a97').text('Your Dental Care, All in One Place.');
      doc.moveDown(0.4);

      const headerY = doc.y;
      doc.strokeColor('#4EBE7D').lineWidth(2)
         .moveTo(50, headerY).lineTo(545, headerY).stroke();

      doc.moveDown(1.4);

      // ============ TITLE ============
      doc.fontSize(18).fillColor('#0A1E29')
         .text('Appointment Summary', { align: 'center' });
      doc.moveDown(1.5);

      // ============ PATIENT + APPOINTMENT ============
      const leftX = 50;
      const rightX = 320;
      const blockY = doc.y;

      doc.fontSize(9).fillColor('#7a8a97').text('PATIENT', leftX, blockY);
      doc.fontSize(13).fillColor('#0A1E29')
         .text(`${data.patient?.first_name ?? ''} ${data.patient?.last_name ?? ''}`, leftX, blockY + 14);
      doc.fontSize(10).fillColor('#4a6272')
         .text(data.patient?.email ?? '', leftX, blockY + 34, { width: 240 });
      doc.text(data.patient?.phone ?? '', leftX, blockY + 48, { width: 240 });
      if (data.patient?.address) {
        doc.text(data.patient.address, leftX, blockY + 62, { width: 240 });
      }

      doc.fontSize(9).fillColor('#7a8a97').text('APPOINTMENT', rightX, blockY);
      doc.fontSize(13).fillColor('#0A1E29')
         .text(new Date(data.appointment_date).toLocaleString('en-PH'), rightX, blockY + 14);
      doc.fontSize(10).fillColor('#4a6272')
         .text(`Status: ${data.status}`, rightX, blockY + 34);
      doc.text(`Payment: ${data.payment_status}`, rightX, blockY + 48);
      if (data.dentist) {
        doc.text(
          `Dentist: Dr. ${data.dentist.first_name} ${data.dentist.last_name}`,
          rightX, blockY + 62
        );
      }

      doc.y = blockY + 110;
      doc.moveDown(0.5);

      // ============ SERVICES TABLE ============
      doc.fontSize(9).fillColor('#7a8a97').text('SERVICES', 50);
      doc.moveDown(0.4);

      const tableHeadY = doc.y;
      doc.fontSize(11).fillColor('#0A1E29').text('Service', 50, tableHeadY);
      doc.text('Price', 450, tableHeadY, { width: 95, align: 'right' });
      doc.moveDown(0.4);

      doc.strokeColor('#e6eef5').lineWidth(1)
         .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.4);

      let total = 0;
      const items = data.items || [];
      if (!items.length) {
        doc.fontSize(11).fillColor('#7a8a97').text('No items', 50);
        doc.moveDown(0.5);
      } else {
        for (const item of items) {
          const lineY = doc.y;
          doc.fontSize(11).fillColor('#0A1E29')
             .text(item.service?.name ?? 'Service', 50, lineY);
          doc.text(`PHP ${Number(item.price).toFixed(2)}`, 450, lineY, {
            width: 95, align: 'right'
          });
          total += Number(item.price);
          doc.moveDown(0.5);
        }
      }

      doc.moveDown(0.3);
      doc.strokeColor('#e6eef5').lineWidth(1)
         .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      const totalY = doc.y;
      doc.fontSize(13).fillColor('#0A1E29').text('Total', 50, totalY);
      doc.fontSize(13).fillColor('#0A1E29')
         .text(`PHP ${total.toFixed(2)}`, 450, totalY, { width: 95, align: 'right' });

      // ============ NOTES ============
      if (data.notes) {
        doc.moveDown(2);
        doc.fontSize(9).fillColor('#7a8a97').text('NOTES', 50);
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#4a6272')
           .text(data.notes, 50, doc.y, { width: 495 });
      }

      // ============ FOOTER ============
      doc.fontSize(9).fillColor('#7a8a97')
         .text(
           `Generated ${new Date().toLocaleString('en-PH')} | EAsmile Dental Clinic`,
           50, 780, { width: 495, align: 'center' }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { appointmentPdf };