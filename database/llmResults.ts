import { db } from './init';

export interface LLMResult {
  id: string;
  eventId?: string;
  userId: string;
  type: 'search' | 'recommendation' | 'planning' | 'qa';
  inputText: string;
  outputText: string;
  createdAt: string;
}

export const llmResultsDb = {
  save: (result: Omit<LLMResult, 'createdAt'>) => {
    const createdAt = new Date().toISOString();
    db.runSync(
      `INSERT INTO llm_results (id, eventId, userId, type, inputText, outputText, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.id, result.eventId || null, result.userId, result.type, result.inputText, result.outputText, createdAt]
    );
  },

  getCached: (userId: string, type: LLMResult['type'], inputText: string): LLMResult | null => {
    return db.getFirstSync(
      'SELECT * FROM llm_results WHERE userId = ? AND type = ? AND inputText = ? ORDER BY createdAt DESC LIMIT 1',
      [userId, type, inputText]
    );
  }
};
