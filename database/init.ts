import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('campusevents.db');

export function initDatabase() {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT
      );

      -- Insertion des comptes par défaut s'ils n'existent pas
      INSERT OR IGNORE INTO users (email, password, role, name) VALUES ('admin@campus.ma', 'admin123', 'admin', 'Admin Campus');
      INSERT OR IGNORE INTO users (email, password, role, name) VALUES ('etudiant@campus.ma', 'etudiant123', 'student', 'Étudiant Démo');

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        startDateTime TEXT NOT NULL,
        endDateTime TEXT,
        locationName TEXT NOT NULL,
        locationAddress TEXT,
        organizerName TEXT NOT NULL,
        capacity INTEGER,
        registeredCount INTEGER DEFAULT 0,
        imageUrl TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        eventId TEXT NOT NULL,
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS favorites (
        eventId TEXT NOT NULL,
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        PRIMARY KEY (eventId, userId),
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS llm_results (
        id TEXT PRIMARY KEY,
        eventId TEXT,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        inputText TEXT NOT NULL,
        outputText TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    seedData();
    console.log('Database initialized and seeded successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

function seedData() {
  const eventCount: any = db.getFirstSync('SELECT COUNT(*) as count FROM events');
  if (eventCount.count > 0) return;

  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 5);
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);

  const events = [
    {
      id: 'e1',
      title: 'Atelier Pratique : Machine Learning avec TensorFlow',
      description: 'Apprenez à construire vos premiers modèles de neurones. Pré-requis : Python de base.',
      category: 'Workshop',
      startDateTime: tomorrow.toISOString(),
      locationName: 'Laboratoire Informatique, Salle 302',
      organizerName: 'Club IA Campus',
      capacity: 25,
      tags: JSON.stringify(['IA', 'Python', 'Tech'])
    },
    {
      id: 'e2',
      title: 'Conférence : L\'avenir de la Cybersécurité en 2026',
      description: 'Un expert mondial partage sa vision sur les menaces émergentes.',
      category: 'Talk',
      startDateTime: nextWeek.toISOString(),
      locationName: 'Amphithéâtre Central',
      organizerName: 'Administration Universitaire',
      capacity: 200,
      tags: JSON.stringify(['Sécurité', 'Networking'])
    },
    {
      id: 'e3',
      title: 'Session de Recrutement : Stage & Premier Emploi',
      description: 'Rencontrez 15 entreprises locales à la recherche de talents.',
      category: 'Other',
      startDateTime: nextWeek.toISOString(),
      locationName: 'Hall d\'exposition',
      organizerName: 'Service Carrière',
      capacity: 500,
      tags: JSON.stringify(['Emploi', 'Networking', 'Stage'])
    },
    {
      id: 'e4',
      title: 'Tournoi d\'Échecs Inter-écoles',
      description: 'Venez défier les meilleurs joueurs du campus. Ouvert à tous les niveaux.',
      category: 'Club',
      startDateTime: tomorrow.toISOString(),
      locationName: 'Cafétéria Bâtiment C',
      organizerName: 'Club Échecs',
      capacity: 40,
      tags: JSON.stringify(['Game', 'Fun'])
    },
    {
      id: 'e5',
      title: 'Examen Blanc : Algorithmique Avancée',
      description: 'Préparez vos partiels dans des conditions réelles.',
      category: 'Exam',
      startDateTime: yesterday.toISOString(),
      locationName: 'Salle 101',
      organizerName: 'Département Info',
      capacity: 60,
      tags: JSON.stringify(['Étude', 'Exam'])
    },
    {
      id: 'e6',
      title: 'Workshop : Design UI/UX Mobile',
      description: 'Améliorez l\'esthétique de vos applications mobiles.',
      category: 'Workshop',
      startDateTime: nextWeek.toISOString(),
      locationName: 'Espace Design',
      organizerName: 'Club Web',
      capacity: 20,
      tags: JSON.stringify(['Design', 'Mobile', 'App'])
    }
  ];

  for (const e of events) {
    db.runSync(
      `INSERT INTO events (id, title, description, category, startDateTime, locationName, organizerName, capacity, tags, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.title, e.description, e.category, e.startDateTime, e.locationName, e.organizerName, e.capacity, e.tags, now.toISOString()]
    );
  }

  // Pre-fill some favorites and registrations for demo
  db.runSync('INSERT OR IGNORE INTO favorites (eventId, userId, createdAt) VALUES (?, ?, ?)', ['e1', 'etudiant@campus.ma', now.toISOString()]);
  db.runSync('INSERT OR IGNORE INTO registrations (id, eventId, userId, createdAt, status) VALUES (?, ?, ?, ?, "confirmed")', ['r1', 'e2', 'etudiant@campus.ma', now.toISOString()]);
}
