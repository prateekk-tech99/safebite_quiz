import { Difficulty, Language, Topic } from '../types';

export async function generateQuizQuestions(count: number, difficulty: Difficulty, topic: Topic, language: Language) {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count,
        difficulty,
        topic,
        language
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || [];

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}