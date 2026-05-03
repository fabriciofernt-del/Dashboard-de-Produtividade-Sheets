import { GoogleGenAI, Type } from "@google/genai";
import { RawData } from "../types";

export async function extractDataFromPDF(base64Data: string): Promise<RawData[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key do Gemini não encontrada. Verifique se a variável está no .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { 
              text: "Leia as tabelas deste PDF de produção hospitalar/atendimentos. Extraia os dados e devolva em JSON estruturado, sendo uma lista de objetos contendo exatamente as chaves: 'colaborador' (string com nome do profissional), 'data' (string no formato AAAA-MM-DD), 'hora' (string no formato HH:MM) e 'qtd' (number). Se não houver quantidade explícita na linha da tabela, defina qtd como 1. Retorne APENAS a array JSON." 
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              colaborador: { type: Type.STRING },
              data: { type: Type.STRING },
              hora: { type: Type.STRING },
              qtd: { type: Type.NUMBER }
            },
          }
        }
      }
    });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(`Falha na IA (Gemini): ${err.message}`);
  }

  const text = response.text || "[]";
  try {
    const rawJSON = JSON.parse(text);
    return rawJSON as RawData[];
  } catch (error) {
    console.error("Erro ao fazer parse do JSON do Gemini:", error, text);
    throw new Error("Erro ao interpretar retorno do Gemini. Formato inválido.");
  }
}
