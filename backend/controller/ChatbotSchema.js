// controllers/chatController.js
import OpenAI from "openai"; // ✅ Correct import

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const getChatResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "Please ask something." });
    }

    // ✅ System prompt ensures chatbot stays medically safe
    const systemPrompt = `
You are a helpful and polite medical assistant chatbot designed for hospital-related queries.
You can provide:
- Information about hospital services
- Appointment details
- General first-aid guidance
- Emergency contact help

⚠️ You must **not** diagnose, treat, or prescribe medicine.
Always include a short disclaimer encouraging the user to consult a doctor.
    `;

    // ✅ Call the latest Chat Completions API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster & cheaper for chat
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
};
