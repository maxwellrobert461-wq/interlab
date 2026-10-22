export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${req.body.reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const d = await r.json();
    if (d.data && d.data.status === 'success' && d.data.amount >= 5000000) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Not verified' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}