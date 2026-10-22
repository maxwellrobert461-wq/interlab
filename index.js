import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Base44 credit costs
const CREDITS_PER_BUILD = 500; // Each build costs 500 credits

export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const { prompt, userCredits } = req.body;
  
  if(userCredits < CREDITS_PER_BUILD) {
    return res.status(402).json({error:'INSUFFICIENT_CREDITS', needed: CREDITS_PER_BUILD, have: userCredits});
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {role:"system", content: "You are INTER AI by OC GLOBAL TECH. Build React apps with Tailwind. Always include wallet, gifts 70/30, blue tick $35, boost $1-$5. Return only code."},
        {role:"user", content: prompt}
      ],
      max_tokens: 4000
    });
    
    // Calculate credits used based on tokens (Base44 way)
    const tokensUsed = completion.usage.total_tokens;
    const creditsUsed = Math.ceil(tokensUsed / 2); // 2 tokens = 1 credit
    
    res.status(200).json({
      code: completion.choices[0].message.content,
      creditsUsed: creditsUsed,
      tokensUsed: tokensUsed,
      remaining: userCredits - creditsUsed
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}