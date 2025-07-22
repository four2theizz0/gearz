import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_HOLDS_TABLE = process.env.AIRTABLE_HOLDS_TABLE || 'Holds';

async function createAirtableHold({
  productId, name, email, phone, pickupDay, otherPickup, notes
}: Record<string, any>) {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) throw new Error('Missing Airtable config');
  const now = new Date();
  let expires = new Date(now);
  if (pickupDay === 'Other' && otherPickup) {
    // Try to parse a custom date/time, fallback to 48h
    const parsed = Date.parse(otherPickup);
    if (!isNaN(parsed)) {
      expires = new Date(parsed);
    } else {
      expires.setHours(now.getHours() + 48);
    }
  } else {
    expires.setHours(now.getHours() + 48);
  }

  // Convert pickupDay to ISO date string if possible
  let pickupDayValue = '';
  let pickupCustom = '';
  if (pickupDay === 'Today') {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Default to noon
    pickupDayValue = today.toISOString();
  } else if (pickupDay === 'Tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    pickupDayValue = tomorrow.toISOString();
  } else if (pickupDay === 'Other' && otherPickup) {
    const parsed = Date.parse(otherPickup);
    if (!isNaN(parsed)) {
      pickupDayValue = new Date(parsed).toISOString();
    } else {
      pickupCustom = otherPickup;
    }
  }

  const fields = {
    Products: [productId],
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    hold_status: 'Active',
    hold_expires_at: expires.toISOString(),
    pickup_day: pickupDayValue || pickupDay, // store ISO string if possible, else fallback
    pickup_custom: pickupCustom,
    notes: notes || '',
  };
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HOLDS_TABLE}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable hold create failed: ${err}`);
  }
  return await res.json();
}

export async function POST(request: NextRequest) {

  try {
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Missing email configuration.' }, { status: 500 });
    }
    const data = await request.json();
    const {
      productId, productName, productPrice,
      name, email, phone, pickupDay, otherPickup, notes
    } = data;
    const pickupDisplay = pickupDay === 'Other' ? otherPickup : pickupDay;

    // 1. Create Airtable Hold
    await createAirtableHold({
      productId, name, email, phone, pickupDay, otherPickup, notes
    });

    // 2. Email content
    const holdMsg = `We will hold this item for you for 48 hours from the time of your request, unless another time is requested.`;

    // Admin email content
    const adminHtml = `
      <h2>New Local Pickup Request</h2>
      <p><b>Product:</b> ${productName} (ID: ${productId})<br/>
      <b>Price:</b> $${productPrice}</p>
      <p><b>Name:</b> ${name}<br/>
      <b>Email:</b> ${email}<br/>
      <b>Phone:</b> ${phone}</p>
      <p><b>Preferred Pickup Day:</b> ${pickupDisplay}</p>
      ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ''}
      <p style="color:#888;">${holdMsg}</p>
      <hr/>
      <small>This is an automated notification from your MMA Gear site.</small>
    `;

    // User confirmation email content
    const userHtml = `
      <h2>Thank you for your purchase request!</h2>
      <p>We received your request for <b>${productName}</b> (ID: ${productId}) at <b>$${productPrice}</b>.</p>
      <p><b>Your Info:</b><br/>
      Name: ${name}<br/>
      Email: ${email}<br/>
      Phone: ${phone}<br/>
      Preferred Pickup Day: ${pickupDisplay}<br/>
      ${notes ? `Notes: ${notes}<br/>` : ''}
      </p>
      <p>${holdMsg}</p>
      <p>We will contact you shortly to confirm a pickup time.</p>
      <hr/>
      <p style="font-size:0.9em;">If you need to <a href="#">edit</a> or <a href="#">cancel</a> your request, click the links.</p>
    `;

    // Send admin email
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New Local Pickup Request: ${productName}`,
        html: adminHtml,
      }),
    });
    if (!adminRes.ok) {
      const err = await adminRes.text();
      return NextResponse.json({ success: false, error: err }, { status: 500 });
    }

    // Send user confirmation email
    const userRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: email,
        subject: `Your MMA Gear Pickup Request: ${productName}`,
        html: userHtml,
      }),
    });
    if (!userRes.ok) {
      const err = await userRes.text();
      return NextResponse.json({ success: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 