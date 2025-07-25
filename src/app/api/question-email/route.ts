import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productId, 
      productName, 
      productPrice, 
      name, 
      email, 
      phone, 
      question,
      notes = "",
      formType 
    } = body;

    // Clean input data
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();
    const cleanQuestion = question?.trim();
    const cleanNotes = notes?.trim() || "";

    // Validate required fields
    if (!productId || !productName || !cleanName || !cleanEmail || !cleanPhone || !cleanQuestion) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (cleanQuestion.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Question must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Phone validation
    const cleanPhoneDigits = cleanPhone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!adminEmail || !fromEmail) {
      console.error('Missing email configuration:', { adminEmail: !!adminEmail, fromEmail: !!fromEmail });
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Email content for admin
    const adminEmailContent = `
<h2>🤔 New Product Question</h2>
<p>A customer has asked a question about a product.</p>

<h3>📦 Product Information</h3>
<ul>
  <li><strong>Product:</strong> ${productName}</li>
  <li><strong>Price:</strong> $${productPrice}</li>
  <li><strong>Product ID:</strong> ${productId}</li>
</ul>

<h3>👤 Customer Information</h3>
<ul>
  <li><strong>Name:</strong> ${cleanName}</li>
  <li><strong>Email:</strong> ${cleanEmail}</li>
  <li><strong>Phone:</strong> ${cleanPhone}</li>
</ul>

<h3>❓ Customer's Question</h3>
<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0;">
  <p style="margin: 0; font-style: italic;">"${cleanQuestion}"</p>
</div>

${cleanNotes ? `
<h3>📝 Additional Notes</h3>
<p>${cleanNotes}</p>
` : ''}

<hr style="margin: 20px 0;">
<p><em>Please respond to the customer within 24 hours. Reply directly to their email: ${cleanEmail}</em></p>
    `;

    // Email content for customer confirmation
    const customerEmailContent = `
<h2>👋 Thank you for your question!</h2>
<p>Hi ${cleanName},</p>
<p>We've received your question about <strong>${productName}</strong> and will get back to you within 24 hours.</p>

<h3>📋 Your Question</h3>
<div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0;">
  <p style="margin: 0;"><strong>Product:</strong> ${productName} ($${productPrice})</p>
  <p style="margin: 10px 0 0 0;"><strong>Your Question:</strong> "${cleanQuestion}"</p>
</div>

<p>📞 <strong>We'll contact you at:</strong> ${cleanPhone}<br>
📧 <strong>Or reply to this email</strong></p>

${cleanNotes ? `<p><strong>Additional notes:</strong> ${cleanNotes}</p>` : ''}

<hr style="margin: 20px 0;">
<p>Thanks for your interest in our MMA gear!</p>
<p><em>- The Gearz Team</em></p>
    `;

    // Send email to admin
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `🤔 Product Question: ${productName}`,
      html: adminEmailContent,
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: `Question Received: ${productName}`,
      html: customerEmailContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Question sent successfully' 
    });

  } catch (error) {
    console.error('Error sending question email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send question' },
      { status: 500 }
    );
  }
}