const { GoogleGenAI } = require('@google/genai');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAcrLJ-BVd0kvuD2mnkFFAoIj6EVQGX-qA';
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("Calling model...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: 'Return JSON with extractedText (string) and evidence (array of strings) with a fake example.',
        }
      ],
      config: {
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      },
    });
    
    console.log("Raw Response Text:\n", response.text);
    
    try {
        JSON.parse(response.text);
        console.log("JSON parsed successfully!");
    } catch(e) {
        console.error("JSON parse failed!", e);
    }
    
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
