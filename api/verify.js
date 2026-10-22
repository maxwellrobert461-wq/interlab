export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const { reference } = req.body;
  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const data = await verifyRes.json();
    if(data.data && data.data.status === 'success' && data.data.amount >= 5000000) { // 50000 Naira = 5000000 kobo
      res.status(200).json({ success: true, message: 'Payment verified — 1 build added' });
    } else {
      res.status(400).json({ success: false, error: 'Payment not verified or amount too small' });
    }
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}