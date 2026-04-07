import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { repo, path, content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert software architect.
Analyze the following file from the repository "${repo}" at path "${path}".

Code:
${content}

Your goal is to generate a Mermaid.js flowchart (graph TD) that maps out the logical flow, function calls, or architecture described in this code. 
Only output valid Mermaid.js syntax. Do not wrap it in markdown block quotes. Output just the raw Mermaid code.

Critical Rules to avoid syntax errors:
1. Always wrap node text strings in double quotes, e.g., A["Initialize App (Config)"].
2. Avoid using raw angle brackets < or > anywhere inside nodes.
3. Keep the graph simple and structurally sound.

Example structure:
graph TD
  A["Start"] --> B{"Is it valid?"}
  B -- Yes --> C["Process"]
  B -- No --> D["Error"]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let diagramText = response.text || "";
    
    // Fallback cleanup if the model wraps it in markdown despite instructions
    if (diagramText.startsWith("```mermaid")) {
       diagramText = diagramText.replace(/```mermaid\n?/g, "");
    }
    diagramText = diagramText.replace(/```\n?/g, "");

    return NextResponse.json({ diagram: diagramText.trim() });
  } catch (error: any) {
    console.error("Diagram API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
