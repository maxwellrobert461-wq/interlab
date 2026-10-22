import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const { prompt } = req.body;
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role:"system", content: "You are INTER AI. Build React apps with Tailwind. Return only code."},
        {role:"user", content: prompt}
      ],
      max_tokens: 3500
    });
    res.status(200).json({ code: completion.choices[0].message.content });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}