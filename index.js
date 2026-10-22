import { useState, useEffect } from 'react';

export default function InterLab() {
  const [prompt, setPrompt] = useState('Build a modern todo app with Tailwind');
  const [code, setCode] = useState('// INTER LAB 👑 Ready — Groq Powered — 3 FREE then ₦50k');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [email, setEmail] = useState('');
  const [deferred, setDeferred] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    setCount(parseInt(localStorage.getItem('inter_count') || '0'));
    setPaid(parseInt(localStorage.getItem('inter_paid') || '0'));
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(s);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferred(e);
      setShowInstall(true);
    });
  }, []);

  async function build() {
    if (count >= 3 && paid <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const d = await res.json();
      if (d.error) setCode('ERROR: ' + d.error);
      else {
        setCode(d.code);
        if (count < 3) {
          const n = count + 1; setCount(n); localStorage.setItem('inter_count', n);
        } else {
          const n = paid - 1; setPaid(n); localStorage.setItem('inter_paid', n);
        }
      }
    } catch (e) { setCode(e.message); }
    setLoading(false);
  }

  function pay() {
    if (!email.includes('@')) { alert('Enter valid email'); return; }
    const h = window.PaystackPop.setup({
      key: 'pk_live_16a8e4130e54cdbd8eb5a693ae37a52d874e3ee0',
      email,
      amount: 50000 * 100,
      currency: 'NGN',
      ref: 'INTERLAB-' + Date.now(),
      callback: function(r) {
        fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: r.reference })
        }).then(x => x.json()).then(d => {
          if (d.success) {
            const n = paid + 1; setPaid(n); localStorage.setItem('inter_paid', n); alert('Paid! 1 build added ✅');
          } else alert('Verification failed');
        });
      }
    });
    h.openIframe();
  }

  function install() {
    if (deferred) deferred.prompt();
    else alert('To install: Chrome menu → Add to Home Screen / Install App');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto p-4">
        <div className="flex justify-between items-center">
          <h1 className="font-black text-xl">INTER LAB 👑</h1>
          {showInstall && <button onClick={install} className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">INSTALL</button>}
        </div>
        <p className="text-xs text-zinc-500 mt-1">{count < 3 ? `${3 - count} FREE LEFT` : `${paid} PAID LEFT`} • Groq + Paystack • Auto Install</p>
        
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 h-24 text-sm focus:outline-none" placeholder="Describe app to build..."></textarea>
        
        {count >= 3 && paid <= 0 ? (
          <div className="bg-white text-black p-4 rounded-xl mt-3">
            <p className="font-bold text-sm">🔒 3 FREE FINISHED — ₦50k PER APP</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email for receipt" className="w-full border border-zinc-200 p-2.5 rounded-lg mt-3 text-sm text-black focus:outline-none" />
            <button onClick={pay} className="w-full bg-black text-white py-3 rounded-full font-bold mt-3">PAY ₦50k WITH PAYSTACK</button>
          </div>
        ) : (
          <button onClick={build} className="w-full bg-white text-black py-3 rounded-full font-bold mt-3 text-sm">{loading ? 'BUILDING WITH GROQ...' : count < 3 ? `BUILD FREE APP (${3 - count} left)` : `BUILD APP (${paid} left)`}</button>
        )}
        
        <pre className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 text-xs overflow-auto whitespace-pre-wrap max-h-[65vh]">{code}</pre>
      </div>
    </div>
  );
}