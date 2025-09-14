import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3001);
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration for production
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? true  // Allow same-origin requests in production (static + API from same host)
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the dist directory in production
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: NODE_ENV
  });
});

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

// Catch-all handler for SPA routing in production
if (NODE_ENV === 'production') {
  // Use a fallback middleware instead of a route
  app.use((req, res, next) => {
    // Skip if this is an API or health route
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next();
    }
    
    // Check if the requested file exists in dist
    const filePath = path.join(__dirname, 'dist', req.path);
    
    // For non-API routes that don't match files, serve index.html
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath);
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT} in ${NODE_ENV} mode`);
  if (NODE_ENV === 'production') {
    console.log('Serving static files from dist directory');
  }
});