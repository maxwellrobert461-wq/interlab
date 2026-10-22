import { useState, useEffect } from 'react';

export default function InterLabPaystack() {
  const [prompt, setPrompt] = useState('Build a todo app');
  const [code, setCode] = useState('// INTER LAB — Paystack Billing\n// 3 free, then ₦50k per app');
  const [loading, setLoading] = useState(false);
  const [buildCount, setBuildCount] = useState(0);
  const [paidBuilds, setPaidBuilds] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(()=>{
    setBuildCount(parseInt(localStorage.getItem('inter_count')||'0'));
    setPaidBuilds(parseInt(localStorage.getItem('inter_paid')||'0'));
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(script);
  },[]);

  async function build() {
    if(buildCount >= 3 && paidBuilds <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/build', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      });
      const data = await res.json();
      if(data.error) setCode('ERROR: '+data.error);
      else {
        setCode(data.code);
        if(buildCount < 3) {
          const n = buildCount+1; setBuildCount(n); localStorage.setItem('inter_count', n);
        } else {
          const n = paidBuilds-1; setPaidBuilds(n); localStorage.setItem('inter_paid', n);
        }
      }
    } catch(e){ setCode('Error: '+e.message); }
    setLoading(false);
  }

  function payWithPaystack() {
    if(!email || !email.includes('@')) { alert('Enter your email for Paystack receipt'); return; }
    const handler = window.PaystackPop.setup({
      key: 'pk_live_16a8e4130e54cdbd8eb5a693ae37a52d874e3ee0',
      email: email,
      amount: 50000 * 100, // ₦50k in kobo
      currency: 'NGN',
      ref: 'INTERLAB-'+Date.now(),
      callback: function(response) {
        fetch('/api/verify', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({reference: response.reference})
        }).then(r=>r.json()).then(d=>{
          if(d.success) {
            const n = paidBuilds+1; setPaidBuilds(n); localStorage.setItem('inter_paid', n);
            alert('Payment verified! 1 build added.');
          } else alert('Payment failed: '+d.error);
        });
      },
      onClose: function(){ alert('Payment closed'); }
    });
    handler.openIframe();
  }

  const freeLeft = 3 - buildCount;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[650px] mx-auto p-4">
        <div className="flex justify-between items-center">
          <h1 className="font-black text-xl">INTER LAB 👑</h1>
          <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">{buildCount < 3 ? `${freeLeft} FREE` : `${paidBuilds} PAID LEFT`}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">OpenAI Platform • 3 free apps, then ₦50k per app via Paystack</p>

        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 h-24 text-sm"></textarea>

        {buildCount >= 3 && paidBuilds <= 0 ? (
          <div className="bg-white text-black p-4 rounded-xl mt-3">
            <p className="font-black text-sm">🔒 FREE BUILDS FINISHED — ₦50k PER APP</p>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter email for receipt" className="w-full border border-zinc-300 p-2 rounded-lg mt-3 text-sm" />
            <button onClick={payWithPaystack} className="w-full bg-[#00C3F7] text-black py-3 rounded-full font-black mt-3">PAY ₦50,000 WITH PAYSTACK</button>
            <p className="text-[10px] text-zinc-500 mt-2 text-center">Secured by Paystack • pk_live_...ee0 • 1 payment = 1 app</p>
          </div>
        ) : (
          <button onClick={build} className="w-full bg-white text-black py-3 rounded-full font-black mt-3">
            {loading ? 'BUILDING...' : buildCount < 3 ? `BUILD FREE (${freeLeft} left)` : `BUILD APP (${paidBuilds} left)`}
          </button>
        )}

        <pre className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 text-xs overflow-auto whitespace-pre-wrap max-h-[65vh]">{code}</pre>
      </div>
    </div>
  );
}