import { db } from './init';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'Talk' | 'Workshop' | 'Club' | 'Exam' | 'Other';
  startDateTime: string;
  endDateTime?: string;
  locationName: string;
  locationAddress?: string;
  organizerName: string;
  capacity?: number;
  registeredCount: number;
  imageUrl?: string;
  tags?: string; // JSON string
  createdAt: string;
}

export const eventsDb = {
  create: (event: Omit<Event, 'registeredCount' | 'createdAt'>) => {
    const createdAt = new Date().toISOString();
    db.runSync(
      `INSERT INTO events (id, title, description, category, startDateTime, endDateTime, locationName, locationAddress, organizerName, capacity, imageUrl, tags, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event.id, event.title, event.description, event.category, event.startDateTime, event.endDateTime || null, event.locationName, event.locationAddress || null, event.organizerName, event.capacity || null, event.imageUrl || null, event.tags || null, createdAt]
    );
  },

  getAll: (): Event[] => {
    return db.getAllSync('SELECT * FROM events ORDER BY startDateTime ASC');
  },

  update: (id: string, event: Partial<Event>) => {
    const fields = Object.keys(event).filter(k => k !== 'id' && k !== 'createdAt');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (event as any)[f]);
    
    db.runSync(
      `UPDATE events SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: (id: string) => {
    db.runSync('DELETE FROM events WHERE id = ?', [id]);
  },

  getById: (id: string): Event | null => {
    return db.getFirstSync('SELECT * FROM events WHERE id = ?', [id]);
  },

  incrementRegisteredCount: (id: string) => {
    db.runSync('UPDATE events SET registeredCount = registeredCount + 1 WHERE id = ?', [id]);
  },

  decrementRegisteredCount: (id: string) => {
    db.runSync('UPDATE events SET registeredCount = registeredCount - 1 WHERE id = ?', [id]);
  }
};
