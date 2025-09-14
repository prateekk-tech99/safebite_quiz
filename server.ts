import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with server-side API key
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey });
};

interface QuizRequest {
  count: number;
  difficulty: string;
  topic: string;
  language: string;
}

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { count, difficulty, topic, language }: QuizRequest = req.body;

    if (!count || !difficulty || !topic || !language) {
      return res.status(400).json({ 
        error: 'Missing required parameters: count, difficulty, topic, language' 
      });
    }

    const ai = getAI();
    
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
    const questions = parsed.questions || [];

    res.json({ questions });

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    res.status(500).json({ 
      error: 'Failed to generate quiz questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});