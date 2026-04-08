import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { repo, path, content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert developer and a great teacher.
Analyze the following file from the repository "${repo}" at path "${path}".

Code:
${content}

Your goal is to provide a concise, structured explanation of everything above.
CRITICAL FORMATTING REQUIREMENT: Always insert TWO blank lines (\n\n) immediately before starting any bulleted/numbered lists (like * or -) so they format and render correctly natively in ReactMarkdown.

Return a single JSON object with the following fields:
1. "beginner": An ELI5 (Explain Like I'm 5) explanation of what this file does, keeping technical jargon to a minimum. Use simple analogies. Make it friendly and formated in markdown.
2. "developer": A deeply technical explanation focusing on architecture, design patterns, and how it might fit into the broader system. Format in markdown.
3. "pseudocode": A step-by-step logic breakdown in standard pseudocode format. Format as markdown code block.
4. "purpose": A 1-sentence summary of the file's purpose.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            beginner: { type: Type.STRING },
            developer: { type: Type.STRING },
            pseudocode: { type: Type.STRING },
            purpose: { type: Type.STRING },
          },
          required: ["beginner", "developer", "pseudocode", "purpose"],
        },
      },
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Explain API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
