import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true  // Required for Vite/browser environments
});

export const invokeLLM = async ({ prompt }) => {
  const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no backticks, just raw JSON.`;

  const result = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // Fast & free on Groq
    messages: [{ role: 'user', content: fullPrompt }],
    response_format: { type: 'json_object' },
  });

  const text = result.choices[0]?.message?.content || '';

  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return text;
  }
};