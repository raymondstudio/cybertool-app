const { GoogleGenAI } = require('@google/genai');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAcrLJ-BVd0kvuD2mnkFFAoIj6EVQGX-qA';
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("Calling model...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
