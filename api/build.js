import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are INTER AI - Expert React developer. Build apps with Tailwind. Return ONLY clean React code with Tailwind classes. No explanation." },
        { role: "user", content: req.body.prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    res.json({ code: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}