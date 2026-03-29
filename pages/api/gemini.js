export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a world-class prompt engineer.

Your task is to convert a rough user input into a clean, production-ready prompt that can be directly used with an AI model.

STRICT RULES (NON-NEGOTIABLE):
- Output ONLY the final prompt
- Do NOT include explanations, reasoning, or commentary
- Do NOT refer to the user's input explicitly
- Do NOT mention phrases like "this prompt", "this input", "given", "based on", or "inferring"
- Do NOT describe what you are doing
- Do NOT include meta-language of any kind

STYLE REQUIREMENTS:
- Write as if this prompt was intentionally crafted by an expert human
- Make it clear, confident, and natural
- Keep it focused, structured, and ready to use
- No unnecessary verbosity

If you violate any of the above rules, the output is incorrect.

Only return the final prompt.

FORMAT:
Start directly with the prompt.
Do not add headings like "Here is the prompt".

User idea:
"${prompt}"

Return ONLY the improved prompt.
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    let text = "No response from Gemini.";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content?.parts;

      if (parts && parts.length > 0) {
        text = parts.map((p) => p.text).join("");
      }
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gemini request failed" });
  }
}