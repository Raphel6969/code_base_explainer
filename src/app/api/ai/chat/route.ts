import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { repo, path, message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Format history for Gemini API
    type Content = {
      role: 'user' | 'model';
      parts: { text: string }[];
    };

    const formattedHistory: Content[] = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session using stable generateContent
    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are an expert developer assistant specialized in understanding code. 
The user is currently exploring the repository "${repo}".
${path ? `They are currently viewing the file at path: "${path}". Keep your answers relevant to this file's context if applicable.` : ''}
Be concise, accurate, and helpful. Format any code snippets in markdown.`,
      }
    });

    return NextResponse.json({ response: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
