import { db } from './init';

export const favoritesDb = {
  add: (eventId: string, userId: string) => {
    const createdAt = new Date().toISOString();
    db.runSync(
      'INSERT OR IGNORE INTO favorites (eventId, userId, createdAt) VALUES (?, ?, ?)',
      [eventId, userId, createdAt]
    );
  },

  remove: (eventId: string, userId: string) => {
    db.runSync(
      'DELETE FROM favorites WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
  },

  isFavorite: (eventId: string, userId: string): boolean => {
    const result = db.getFirstSync(
      'SELECT eventId FROM favorites WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    return !!result;
  },

  getUserFavorites: (userId: string): any[] => {
    return db.getAllSync(
      `SELECT e.* FROM events e 
       JOIN favorites f ON e.id = f.eventId 
       WHERE f.userId = ?
       ORDER BY e.startDateTime ASC`,
      [userId]
    );
  }
};
