import * as SQLite from "expo-sqlite";


 export const db = SQLite.openDatabaseSync("ampela.db");
// db.closeSync();

// SQLite.deleteDatabaseSync("ampela.db");

export const addUser = async (
  username,
  password,
  profession,
  lastMenstruationDate,
  durationMenstruation,
  cycleDuration,
  email
) => {
  const statement = await db.prepareAsync(
    "INSERT INTO users (username, password, profession, lastMenstruationDate, durationMenstruation, cycleDuration, email) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  try {
    const result = await statement.executeAsync([
      username,
      password,
      profession,
      lastMenstruationDate,
      durationMenstruation,
      cycleDuration,
      email,
    ]);
    console.log("User added:", result);
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

export const initializeDatabase = async () => {
  try {
    const result = await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL ,
        password TEXT NOT NULL,
        profession TEXT NULL,
        lastMenstruationDate DATE NULL,
        durationMenstruation INTEGER NULL,
        cycleDuration INTEGER NULL,
        email TEXT NULL
      );
    `);
    console.log("Database initialized:", result);
    return result;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
