import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Language, Topic, WrongAnswerPayload } from '../types';

// Lazy-initialize the AI client to prevent app crash on load
// if the API key environment variable is not available.
let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    // This will throw an error if process.env.API_KEY is not defined,
    // which will be caught by the calling function's error handler.
    // This prevents a blank screen and allows the app to show a proper error message.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export async function generateQuizQuestions(count: number, difficulty: Difficulty, topic: Topic, language: Language) {
  try {
    const aiClient = getAiClient();
    // A simpler, more direct prompt that relies on the response schema for formatting.
    const prompt = `Generate ${count} multiple-choice questions for a Food Safety Officer exam.
Language: ${language}.
Difficulty: ${difficulty}.
Topic: ${topic}.
Each question must be a realistic, scenario-based question a Food Safety Officer might encounter.
For each question, provide a question text, four options, the 0-based index of the correct answer, and a detailed explanation for why that answer is correct.
The entire output must be in ${language}.`;

    const response = await aiClient.models.generateContent({
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
                    description: "A detailed explanation of the correct answer.",
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

    let jsonString = response.text.trim();
    
    if (!jsonString) {
      console.error("Received empty response from API.");
      return []; // Prevents crash, triggers 'errorGeneration' message in UI.
    }

    // The model might wrap the JSON in a markdown block.
    // This more robust regex handles optional 'json' language identifier and surrounding whitespace.
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1].trim();
    }

    // If after stripping markdown, the string is empty, return empty array.
    if (!jsonString) {
        console.error("JSON string is empty after attempting to strip markdown.");
        return [];
    }
    
    const parsed = JSON.parse(jsonString);
    return parsed.questions || [];

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Re-throw the error so it can be caught by the component's error handler in App.tsx
    throw error;
  }
}


export async function generateFeedback(topic: Topic, difficulty: Difficulty, wrongAnswers: WrongAnswerPayload[], language: Language) {
  try {
    const aiClient = getAiClient();
    const mistakesString = wrongAnswers.map(wa => `
- Question: "${wa.question}"
- Options: ${wa.options.join(', ')}
- Correct Answer: "${wa.correctAnswer}"
- Student's Answer: "${wa.userAnswer}"
`).join('');

    const prompt = `You are an expert food safety tutor. A student has just taken a quiz on "${topic}" at the "${difficulty}" level. They made the following mistakes:
${mistakesString}

Based on these specific mistakes, please provide a concise, personalized study plan for the student. The plan should:
1. Identify the core concepts or principles the student is misunderstanding in a friendly and encouraging tone.
2. Provide brief, clear explanations of these concepts.
3. Suggest 2-3 specific topics to focus on for future study.
4. The entire response must be in ${language}.
5. Use markdown for formatting (e.g., lists with '-', and bold text with '**').`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw new Error("Failed to generate AI feedback.");
  }
}