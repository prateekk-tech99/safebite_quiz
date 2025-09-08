
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(count: number, difficulty: Difficulty) {
  try {
    const prompt = `Generate ${count} unique multiple-choice questions for a Food Safety Officer exam with ${difficulty} difficulty. 
    The topics should cover a mix of foodborne illnesses, HACCP principles, food preservation techniques, sanitation regulations, and food microbiology.
    For each question, provide four distinct options, the index of the correct answer (0-3), and a brief but clear explanation for why the answer is correct.
    The output must be in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: `An array of ${count} quiz questions.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The question text.",
                  },
                  options: {
                    type: Type.ARRAY,
                    description: "An array of 4 possible answers.",
                    items: {
                      type: Type.STRING,
                    },
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "The 0-based index of the correct answer in the options array.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A brief explanation of the correct answer.",
                  },
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.questions || [];

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}
