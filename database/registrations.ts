import { db } from './init';
import { eventsDb } from './events';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

export const registrationsDb = {
  create: (registration: Omit<Registration, 'createdAt' | 'status'>) => {
    const createdAt = new Date().toISOString();
    
    // Check if already registered
    const existing = db.getFirstSync(
      'SELECT id FROM registrations WHERE eventId = ? AND userId = ? AND status = "confirmed"',
      [registration.eventId, registration.userId]
    );

    if (existing) throw new Error('Déjà inscrit à cet événement');

    db.runSync(
      'INSERT INTO registrations (id, eventId, userId, createdAt, status) VALUES (?, ?, ?, ?, "confirmed")',
      [registration.id, registration.eventId, registration.userId, createdAt]
    );
    
    eventsDb.incrementRegisteredCount(registration.eventId);
  },

  getUserRegistrations: (userId: string): any[] => {
    return db.getAllSync(
      `SELECT r.*, e.title, e.startDateTime, e.locationName 
       FROM registrations r 
       JOIN events e ON r.eventId = e.id 
       WHERE r.userId = ? AND r.status = "confirmed"
       ORDER BY e.startDateTime ASC`,
      [userId]
    );
  },

  cancel: (registrationId: string) => {
    const reg: any = db.getFirstSync('SELECT eventId FROM registrations WHERE id = ?', [registrationId]);
    if (reg) {
      db.runSync('UPDATE registrations SET status = "cancelled" WHERE id = ?', [registrationId]);
      eventsDb.decrementRegisteredCount(reg.eventId);
    }
  },

  isUserRegistered: (eventId: string, userId: string): boolean => {
    const result = db.getFirstSync(
      'SELECT id FROM registrations WHERE eventId = ? AND userId = ? AND status = "confirmed"',
      [eventId, userId]
    );
    return !!result;
  }
};
