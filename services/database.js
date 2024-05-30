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

export const getUser = async () => {
  try {
    const result = await db.getFirstAsync("SELECT * FROM users where id=1");
    return result;
  } catch (error) {
    console.error("Error getting user info", error);
    throw error;
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

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS first_time (
        id INTEGER PRIMARY KEY,
        status INTEGER DEFAULT 0
      );
      `);
    console.log("Database initialized:", result);
    return result;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const isFirstLaunch = async () => {
  try {
    const result = await db.getFirstAsync("SELECT * FROM first_time");

    if (result == null) {
      await db.runAsync("INSERT INTO first_time(status) VALUES (1);");
    }
    // console.log(result);

    return result;
  } catch (error) {
    console.error("Error checking first launch:", error);
    throw error;
  }
};

export const setFirstLaunchFalse = async () => {
  try {
    const result = await db.runAsync(`
      UPDATE first_time SET status = 0 WHERE id = 1;
    `);
    console.log("First launch flag set:", result);
    return result;
  } catch (error) {
    console.error("Error setting first launch flag:", error);
    throw error;
  }
};
