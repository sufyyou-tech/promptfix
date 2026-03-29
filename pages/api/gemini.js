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
You are a professional prompt engineer.

Your ONLY task is to convert a simple idea into a high-quality AI prompt.

STRICT RULES:
- DO NOT generate the final answer
- DO NOT continue after the prompt
- DO NOT explain anything
- Do NOT mention the user's original input explicitly
- Do NOT refer to "this input", "brevity", or "given the prompt"
- Do NOT explain your reasoning
- Do NOT add meta commentary
- OUTPUT ONLY THE PROMPT

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