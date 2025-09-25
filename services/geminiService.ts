import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Language, Topic, WrongAnswerPayload } from '../types';

// Use a variable to hold the singleton instance of the AI client.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents the app from crashing on startup if the `process.env.API_KEY`
 * is not available, which is common in browser-only environments.
 * The error is deferred until an actual API call is made.
 * @returns {GoogleGenAI} The initialized AI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }

  // This check will fail and throw an error if the hosting environment
  // has not properly configured and exposed the process.env.API_KEY variable.
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
}

export async function generateQuizQuestions(count: number, difficulty: Difficulty, topic: Topic, language: Language) {
  try {
    const client = getAiClient();
    const prompt = `Generate ${count} unique, scenario-based multiple-choice questions for a Food Safety Officer exam, in ${language}. 
    The difficulty level should be ${difficulty}.
    The topic must be strictly focused on: ${topic}.
    The questions must present real-life situations a Food Safety Officer might encounter. The complexity of the scenario must match the difficulty level:
    - For 'Beginner': Simple, direct scenarios on fundamental topics within ${topic}.
    - For 'Intermediate': More detailed situations requiring application of knowledge within ${topic}.
    - For 'Expert': Complex, multi-faceted problems involving investigation, regulation interpretation, and critical decision-making within ${topic}.
    For each question, provide:
    1. The question text.
    2. Four distinct options.
    3. The 0-based index of the correct answer.
    4. A detailed, comprehensive explanation for why the answer is correct.
    The entire output, including questions, options, and explanations, must be in ${language} and formatted as a single JSON object.`;

    const response = await client.models.generateContent({
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

    const jsonString = response.text.trim();
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
    const client = getAiClient();
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

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw new Error("Failed to generate AI feedback.");
  }
}