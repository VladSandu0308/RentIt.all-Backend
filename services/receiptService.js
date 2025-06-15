const PDFDocument = require('pdfkit');
const { storage, ref, uploadBytes, getDownloadURL } = require('./firebaseClient');

class ReceiptService {
    static async generateReceiptPDF(booking, location, user) {
        try {
            console.log('🧾 Starting receipt generation for booking:', booking._id);
            
            const doc = new PDFDocument();
            const chunks = [];

            // Collect PDF data in memory
            doc.on('data', chunk => chunks.push(chunk));
            
            return new Promise((resolve, reject) => {
                doc.on('end', async () => {
                    try {
                        const pdfBuffer = Buffer.concat(chunks);
                        
                        // Upload to Firebase Storage using Client SDK
                        const fileName = `receipts/receipt_${booking._id}_${Date.now()}.pdf`;
                        const storageRef = ref(storage, fileName);
                        
                        const snapshot = await uploadBytes(storageRef, pdfBuffer, {
                            contentType: 'application/pdf',
                            customMetadata: {
                                'booking_id': booking._id.toString(),
                                'user_id': user._id.toString(),
                                'generated_at': new Date().toISOString()
                            }
                        });
                        
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        console.log('✅ Receipt uploaded to Firebase:', downloadURL);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error('❌ Error uploading receipt to Firebase:', error);
                        reject(error);
                    }
                });

                doc.on('error', (error) => {
                    console.error('❌ PDF generation error:', error);
                    reject(error);
                });

                // Calculate booking details
                const checkInDate = new Date(booking.from);
                const checkOutDate = new Date(booking.to);
                const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                const pricePerNight = booking.total_amount / nights;

                // Generate PDF content
                // Header with company name
                doc.fontSize(24).text('RentIT.all', 50, 30, { align: 'center' });
                doc.fontSize(16).text('SIMPLE RECEIPT / CHITANTA SIMPLA', 50, 60, { align: 'center' });
                
                // Date and receipt number
                const receiptNumber = `REC-${booking._id.toString().slice(-8).toUpperCase()}`;
                doc.fontSize(10)
                   .text(`Date: ${new Date().toLocaleDateString('en-US')}`, 400, 30)
                   .text(`Receipt No: ${receiptNumber}`, 400, 45);

                // Separator line
                doc.moveTo(50, 90).lineTo(550, 90).stroke();

                // Property information
                doc.fontSize(14).text('PROPERTY INFORMATION', 50, 110);
                doc.fontSize(12)
                   .text(`Property: ${location.title}`, 70, 135)
                   .text(`Address: ${location.location}`, 70, 155)
                   .text(`Host: ${location.host_email}`, 70, 175);

                // Guest information  
                doc.fontSize(14).text('GUEST INFORMATION', 50, 210);
                doc.fontSize(12)
                   .text(`Name: ${user.first_name} ${user.last_name}`, 70, 235)
                   .text(`Email: ${user.email}`, 70, 255)
                   .text(`Phone: ${user.phone || 'Not provided'}`, 70, 275);

                // Booking details
                doc.fontSize(14).text('BOOKING DETAILS', 50, 310);
                doc.fontSize(12)
                   .text(`Check-in: ${checkInDate.toLocaleDateString('en-US')} (${checkInDate.toLocaleDateString('en-US', { weekday: 'long' })})`, 70, 335)
                   .text(`Check-out: ${checkOutDate.toLocaleDateString('en-US')} (${checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })})`, 70, 355)
                   .text(`Number of nights: ${nights}`, 70, 375)
                   .text(`Price per night: ${pricePerNight.toFixed(2)} RON`, 70, 395);

                // Cost breakdown box
                doc.rect(50, 430, 500, 80).stroke();
                doc.fontSize(14).text('COST BREAKDOWN', 60, 445);
                doc.fontSize(12)
                   .text(`${nights} nights × ${pricePerNight.toFixed(2)} RON`, 70, 470)
                   .text('Taxes included', 70, 490);

                // Total amount - highlighted
                doc.fontSize(16)
                   .text(`TOTAL PAID: ${booking.total_amount} RON`, 320, 475, { 
                       width: 200, 
                       align: 'right' 
                   });

                // Payment confirmation
                doc.fontSize(14).text('PAYMENT CONFIRMATION', 50, 530);
                doc.fontSize(11)
                   .text(`Payment was successfully processed on ${new Date().toLocaleDateString('en-US')}`, 70, 555)
                   .text(`Status: Booking confirmed`, 70, 575)
                   .text(`Transaction ID: ${booking._id}`, 70, 595);

                // Important notes
                doc.fontSize(10)
                   .text('IMPORTANT NOTES:', 50, 640)
                   .text('• This is a simple receipt for payment confirmation', 70, 660)
                   .text('• For fiscal invoice, request from your account dashboard', 70, 675)
                   .text('• Keep this receipt as proof of payment', 70, 690)
                   .text('• For questions contact the host or support@rentit.all', 70, 705);

                // Footer
                doc.fontSize(8)
                   .text('Automatically generated by RentIT.all platform', 50, 750, { align: 'center' })
                   .text(`Receipt generated at: ${new Date().toLocaleString('en-US')}`, 50, 765, { align: 'center' });

                // Finalize PDF
                doc.end();
            });
        } catch (error) {
            console.error('❌ Receipt generation failed:', error);
            throw error;
        }
    }
}

module.exports = ReceiptService;