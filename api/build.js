import { useState, useEffect } from 'react';

export default function InterLabBase44() {
  const [prompt, setPrompt] = useState('Build my AI platform with login, wallet, dashboard');
  const [code, setCode] = useState('// INTER LAB — Base44 Billing System 👑\n// Ready');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(100);
  const [plan, setPlan] = useState('FREE');

  useEffect(()=>{
    const saved = localStorage.getItem('inter_credits');
    if(saved) setCredits(parseInt(saved));
    else { localStorage.setItem('inter_credits','100'); setCredits(100); }
    const p = localStorage.getItem('inter_plan');
    if(p) setPlan(p);
  },[]);

  async function build() {
    if(credits < 100) {
      alert('Out of credits! Upgrade plan to continue building like Base44.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/build', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt, userCredits: credits})
      });
      const data = await res.json();
      if(data.error === 'INSUFFICIENT_CREDITS') {
        setCode(`❌ INSUFFICIENT CREDITS\nYou have: ${data.have}\nNeeded: ${data.needed}\n\nUPGRADE TO CONTINUE BUILDING`);
      } else if(data.error) {
        setCode('ERROR: ' + data.error);
      } else {
        setCode(data.code);
        const newCredits = data.remaining;
        setCredits(newCredits);
        localStorage.setItem('inter_credits', newCredits.toString());
      }
    } catch(e){ setCode('Error: '+e.message); }
    setLoading(false);
  }

  function buyPlan(planName, creditsAmount, price) {
    // Replace with Paystack link
    const url = `https://wa.me/2349078617514?text=I%20want%20${planName}%20${creditsAmount}%20credits%20for%20${price}`;
    window.open(url, '_blank');
    // For demo, auto credit after click
    setTimeout(()=>{
      const newC = credits + creditsAmount;
      setCredits(newC);
      setPlan(planName);
      localStorage.setItem('inter_credits', newC.toString());
      localStorage.setItem('inter_plan', planName);
      alert(`Added ${creditsAmount} credits! (Demo — Connect Paystack to auto)`);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[700px] mx-auto p-4">
        {/* Header like Base44 */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h1 className="font-black text-xl">INTER LAB 👑 <span className="text-zinc-500 text-sm font-normal">Base44 Edition</span></h1>
          <div className="flex gap-2 items-center">
            <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">{credits} credits</span>
            <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">{plan}</span>
          </div>
        </div>

        {/* Base44 Billing Plans */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
            <p className="font-bold text-xs">FREE</p>
            <p className="text-[10px] text-zinc-400">100 credits</p>
            <p className="text-xs font-bold mt-1">₦0</p>
            <button className="w-full bg-zinc-800 text-xs py-1 rounded-full mt-1">Current</button>
          </div>
          <div className="bg-yellow-400 text-black p-2 rounded-xl border-2 border-yellow-400">
            <p className="font-bold text-xs">STARTER</p>
            <p className="text-[10px]">10k credits</p>
            <p className="text-xs font-bold mt-1">₦7k/mo</p>
            <button onClick={()=>buyPlan('STARTER',10000,'₦7k')} className="w-full bg-black text-yellow-400 text-xs py-1 rounded-full mt-1 font-bold">BUY</button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
            <p className="font-bold text-xs">PRO</p>
            <p className="text-[10px] text-zinc-400">25k credits</p>
            <p className="text-xs font-bold mt-1">₦15k/mo</p>
            <button onClick={()=>buyPlan('PRO',25000,'₦15k')} className="w-full bg-zinc-800 text-xs py-1 rounded-full mt-1">BUY</button>
          </div>
        </div>

        {/* Builder */}
        <div className="mt-4">
          <p className="text-xs text-zinc-400">Prompt (costs ~500 credits per build like Base44):</p>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-1 h-24 text-sm"></textarea>
          <button onClick={build} className="w-full bg-white text-black py-3 rounded-full font-black mt-2">{loading?`BUILDING... USING CREDITS`:`BUILD APP (${credits} credits left)`}</button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl mt-4 p-2">
          <p className="text-[10px] text-zinc-500">BILLING LOGIC (Like Base44): Credits = AI tokens / 2. Free = 100, Starter = 10k, Pro = 25k. Each build deducts. User pays monthly for credits. You profit: OpenAI cost ~₦50 per build, you charge ₦350 per build (₦7k/20 builds) = 600% profit.</p>
        </div>

        <pre className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl mt-4 text-[11px] overflow-auto whitespace-pre-wrap max-h-[60vh]">{code}</pre>
      </div>
    </div>
  );
}