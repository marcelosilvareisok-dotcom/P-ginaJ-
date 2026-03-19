import { GoogleGenAI, Type, Modality } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      // Return a dummy instance or throw a more graceful error that can be caught
      // by the calling functions without crashing the whole app on load.
      // We'll initialize with a dummy key so the app doesn't crash on startup,
      // but API calls will fail when attempted.
      aiInstance = new GoogleGenAI({ apiKey: 'dummy-key-to-prevent-crash' });
    } else {
      aiInstance = new GoogleGenAI({ apiKey });
    }
  }
  return aiInstance;
}

export async function generatePageContent(serviceName: string, description: string, price: string) {
  const ai = getAI();
  const prompt = `
    You are an expert copywriter and marketer.
    A user wants to create a professional service page.
    Service Name: ${serviceName}
    Description: ${description}
    Price: ${price}

    Generate a catchy, professional title (max 60 chars) and an optimized, persuasive description (max 500 chars) that will convince customers to buy this service.
    Return ONLY a JSON object with 'title' and 'description' keys.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['title', 'description'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('Failed to generate content');
  return JSON.parse(text);
}

export async function generateSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error('Failed to generate speech');
  return `data:audio/mp3;base64,${base64Audio}`;
}

export async function findLocalCompetitors(serviceName: string, lat: number, lng: number) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Quais são os principais concorrentes locais para o serviço de "${serviceName}" perto de mim? Me dê dicas de como me destacar deles.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng,
          }
        }
      }
    },
  });

  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.maps?.uri).filter(Boolean) || []
  };
}

export async function chatWithBot(history: any[], message: string) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: 'You are a helpful assistant for PáginaJá, a platform that helps freelancers and service providers create quick, professional sales pages. You give advice on how to sell better, improve their service descriptions, and use the platform. Keep answers concise and encouraging.',
      tools: [{ googleSearch: {} }],
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
