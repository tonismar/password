import { GoogleGenAI } from "@google/genai";
import { GameColor, Guess, FeedbackType } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIHint = async (
  guesses: Guess[],
  secretCode: GameColor[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a textual representation of the game state
    const historyText = guesses.map((g, idx) => {
      const colors = g.colors.join(', ');
      const feedback = g.feedback
        .filter(f => f !== FeedbackType.NONE)
        .map(f => f === FeedbackType.EXACT ? 'Preto (Certo)' : 'Branco (Cor certa, lugar errado)')
        .join(', ') || 'Nenhum acerto';
      return `Tentativa ${idx + 1}: Cores [${colors}] -> Resultado: [${feedback}]`;
    }).join('\n');

    const prompt = `
      Você é um especialista no jogo Mastermind (Senha).
      O código secreto (que o usuário NÃO sabe) é: ${secretCode.join(', ')}.
      
      Aqui está o histórico de tentativas do usuário até agora:
      ${historyText}
      
      Por favor, analise a lógica e dê uma dica curta e útil (máximo 2 frases) para a próxima jogada.
      NÃO revele o código secreto explicitamente.
      Se o usuário estiver longe, sugira eliminar cores ou tentar posições novas.
      Se estiver perto, aponte sutilmente qual cor pode estar no lugar certo ou errado.
      Responda em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente de jogo lógico. Seja conciso e direto.",
        temperature: 0.7, // Little creativity allowed for the hint phrasing
      }
    });

    return response.text || "Não foi possível gerar uma dica no momento.";
  } catch (error) {
    console.error("Erro ao obter dica da IA:", error);
    return "A IA está pensando muito... tente novamente mais tarde.";
  }
};