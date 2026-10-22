import { useState, useEffect } from 'react';

export default function InterLab() {
  const [prompt, setPrompt] = useState('Build a todo app');
  const [code, setCode] = useState('// INTER LAB — OpenAI Platform\n// 3 free builds, then ₦50k per app');
  const [loading, setLoading] = useState(false);
  const [buildCount, setBuildCount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setBuildCount(parseInt(localStorage.getItem('inter_count') || '0'));
    setPaid(parseInt(localStorage.getItem('inter_paid') || '0'));
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(s);
  }, []);

  async function buildApp() {
    if (buildCount >= 3 && paid <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) setCode('ERROR: ' + data.error);
      else {
        setCode(data.code);
        if (buildCount < 3) {
          const n = buildCount + 1;
          setBuildCount(n);
          localStorage.setItem('inter_count', n.toString());
        } else {
          const n = paid - 1;
          setPaid(n);
          localStorage.setItem('inter_paid', n.toString());
        }
      }
    } catch (e) { setCode('Error: ' + e.message); }
    setLoading(false);
  }

  function payNow() {
    if (!email.includes('@')) { alert('Enter valid email'); return; }
    const handler = window.PaystackPop.setup({
      key: 'pk_live_16a8e4130e54cdbd8eb5a693ae37a52d874e3ee0',
      email: email,
      amount: 50000 * 100,
      currency: 'NGN',
      ref: 'INTERLAB-' + Date.now(),
      callback: function (response) {
        fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference })
        }).then(r => r.json()).then(d => {
          if (d.success) {
            const n = paid + 1;
            setPaid(n);
            localStorage.setItem('inter_paid', n.toString());
            alert('Payment verified! 1 build added');
          } else alert('Verify failed: ' + d.error);
        });
      },
      onClose: function () { alert('Payment closed'); }
    });
    handler.openIframe();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto p-4">
        <h1 className="font-black text-xl">INTER LAB 👑</h1>
        <p className="text-xs text-zinc-500">{buildCount < 3 ? `${3 - buildCount} FREE LEFT` : `${paid} PAID LEFT`} • 3 free, then ₦50k per app</p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 h-28 text-sm"></textarea>
        {buildCount >= 3 && paid <= 0 ? (
          <div className="bg-white text-black p-4 rounded-xl mt-3">
            <p className="font-bold text-sm">🔒 3 FREE FINISHED</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email for Paystack receipt" className="w-full border p-2 rounded-lg mt-3 text-sm text-black" />
            <button onClick={payNow} className="w-full bg-black text-white py-3 rounded-full font-bold mt-3">PAY ₦50k WITH PAYSTACK</button>
          </div>
        ) : (
          <button onClick={buildApp} className="w-full bg-white text-black py-3 rounded-full font-black mt-3">{loading ? 'BUILDING...' : buildCount < 3 ? `BUILD FREE (${3 - buildCount} left)` : `BUILD APP (${paid} left)`}</button>
        )}
        <pre className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 text-xs overflow-auto whitespace-pre-wrap max-h-[65vh]">{code}</pre>
      </div>
    </div>
  );
}