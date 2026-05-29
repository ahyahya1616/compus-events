import { llmResultsDb } from '../database/llmResults';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const cleanJSON = (text: string): string => {
  try {
    // Attempt to extract JSON from markdown code blocks
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonPart = match ? match[1] : text;
    return jsonPart.trim();
  } catch (e) {
    return text.trim();
  }
};

export type LLMTask = 'search' | 'recommendation' | 'planning' | 'qa';

interface LLMRequest {
  userId: string;
  type: LLMTask;
  inputText: string;
  contextData: any;
}

export const llmService = {
  async runTask({ userId, type, inputText, contextData }: LLMRequest): Promise<string> {
    // Check cache first
    const cached = llmResultsDb.getCached(userId, type, inputText);
    if (cached) {
      // Si c'est une tâche JSON, on vérifie que le cache est valide
      if (type === 'search' || type === 'recommendation') {
        try {
          JSON.parse(cached.outputText);
          console.log('Using valid cached LLM result');
          return cached.outputText;
        } catch (e) {
          console.warn('Cache invalide détecté, appel API forcé');
          // On continue pour faire un nouvel appel API
        }
      } else {
        console.log('Using cached LLM result');
        return cached.outputText;
      }
    }

    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      throw new Error('Clé API Groq non configurée. Veuillez la renseigner dans le fichier .env');
    }

    const systemPrompt = getSystemPrompt(type);
    const userPrompt = `Données (JSON): ${JSON.stringify(contextData)}\n\nRequête utilisateur: ${inputText}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 2048,
          ...( (type === 'search' || type === 'recommendation') ? { response_format: { type: "json_object" } } : {} )
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Groq');
      }

      const data = await response.json();
      const rawOutput = data.choices?.[0]?.message?.content || '';
      const outputText = cleanJSON(rawOutput);

      if (!outputText) {
        throw new Error('L\'IA a renvoyé une réponse vide.');
      }

      // Save to cache
      llmResultsDb.save({
        id: Math.random().toString(36).substring(2, 15),
        userId,
        type,
        inputText,
        outputText,
      });

      return outputText;
    } catch (error) {
      console.error('LLM Task Error:', error);
      throw error;
    }
  }
};

function getSystemPrompt(type: LLMTask): string {
  switch (type) {
    case 'search':
      return `Tu es un assistant universitaire expert en recherche sémantique. 
      Analyse le catalogue d'événements fourni et identifie ceux qui correspondent le mieux à la requête de l'étudiant, même s'il n'y a pas de correspondance de mots-clés exacte.
      Réponds en format JSON structuré: { "results": [ { "id": "uuid", "justification": "courte explication en français" } ] }. 
      Si aucun résultat, retourne une liste vide. Ne parle pas, réponds uniquement en JSON.`;
    
    case 'recommendation':
      return `Tu es un conseiller d'orientation universitaire. 
      Analyse l'historique de l'étudiant (favoris et inscriptions) et suggère exactement 3 événements à venir issus du catalogue qu'il n'a pas encore consultés.
      Justifie chaque choix par rapport à ses centres d'intérêt passés.
      Réponds en format JSON structuré: { "recommendations": [ { "id": "uuid", "reason": "courte justification" } ] }. 
      Sois concis, maximum 200 caractères par justification.
      Réponds uniquement en JSON.`;

    case 'planning':
      return `Tu es un planificateur d'agenda universitaire. 
      L'étudiant va te donner ses contraintes (cours, examens, préférences). 
      Analyse les événements de la semaine et propose un planning optimisé sans conflits.
      Réponds avec un texte clair et structuré en Markdown, avec des émoticônes, en français.`;

    case 'qa':
      return `Tu es l'encyclopédie des événements du campus. 
      Réponds à toute question sur le catalogue global avec précision et courtoisie.
      Base-toi uniquement sur les données fournies. Si l'info n'y est pas, dis-le.
      Réponds en français, avec un ton professionnel.`;
    
    default:
      return "Tu es un assistant intelligent pour les étudiants sur le campus.";
  }
}
