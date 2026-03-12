import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const models = await groq.models.list();
    console.log("Vision models:", models.data.map(m => m.id).filter(id => id.includes('vision')));
    console.log("All models:", models.data.map(m => m.id));
  } catch (err) {
    console.error(err);
  }
}
main();
