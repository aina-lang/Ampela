import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("ampela.db");

export const addUser = async (
  username,
  profession,
  lastMenstruationDate,
  durationMenstruation,
  cycleDuration,
  email,
  photoUri
) => {
  const statement = await db.prepareAsync(
    "INSERT INTO users (username, profession, lastMenstruationDate, durationMenstruation, cycleDuration, email, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  try {
    return await statement.executeAsync([
      username,
      profession,
      lastMenstruationDate,
      durationMenstruation,
      cycleDuration,
      email,
      photoUri,
    ]);
  } finally {
    await statement.finalizeAsync();
  }
};

export const updateUserSqlite = async (
  id,
  username,
  profession,
  lastMenstruationDate,
  durationMenstruation,
  cycleDuration,
  email,
  profileImage
) => {
  const statement = await db.prepareAsync(
    `UPDATE users
     SET username = ?,
         profession = ?,
         lastMenstruationDate = ?,
         durationMenstruation = ?,
         cycleDuration = ?,
         email = ?,
         profileImage = ?
     WHERE id = ?`
  );

  try {
    return await statement.executeAsync([
      username,
      profession,
      lastMenstruationDate,
      durationMenstruation,
      cycleDuration,
      email,
      profileImage,
      id,
    ]);
  } finally {
    await statement.finalizeAsync();
  }
};

/** Rôle (utilisatrice / professionnelle de santé) de l'utilisatrice locale. */
export const updateUserRoleSqlite = async (id, role) => {
  return db.runAsync("UPDATE users SET role = ? WHERE id = ?", [role, id]);
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

// Colonne « role » ajoutée après coup : utilisatrice par défaut.
const addRoleColumn = async () => {
  try {
    const columns = await db.getAllAsync("PRAGMA table_info(users)");
    if (!columns.some((c) => c.name === "role")) {
      await db.execAsync("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';");
    }
  } catch (error) {
    console.error("Role column migration failed:", error);
  }
};

// Les anciennes versions stockaient le mot de passe en clair dans SQLite.
// On supprime la colonne (et la donnée) sur les installations existantes.
const dropLegacyPasswordColumn = async () => {
  try {
    const columns = await db.getAllAsync("PRAGMA table_info(users)");
    if (columns.some((c) => c.name === "password")) {
      await db.execAsync("ALTER TABLE users DROP COLUMN password;");
    }
  } catch (error) {
    // SQLite < 3.35 ne supporte pas DROP COLUMN : on écrase au moins la donnée.
    try {
      await db.execAsync("UPDATE users SET password = '';");
    } catch (_) {}
  }
};

/**
 * Les anciennes versions terminaient la période féconde à J1 + (cycle − 12)
 * au lieu de J1 + (cycle − 11) (méthode du calendrier). On allonge d'un
 * jour les cycles enregistrés avec l'ancienne formule (fenêtre de 6 jours).
 */
const fixFecundityPeriodEnd = async () => {
  try {
    await db.runAsync(
      `UPDATE cycles_menstruels
         SET fecundityPeriodEnd = date(fecundityPeriodStart, '+7 days')
       WHERE julianday(fecundityPeriodEnd) - julianday(fecundityPeriodStart) = 6`
    );
  } catch (error) {
    console.error("Fecundity period migration failed:", error);
  }
};

export const initializeDatabase = async () => {
  try {
    const result = await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL ,
        profession TEXT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        lastMenstruationDate DATE NULL,
        durationMenstruation INTEGER NULL,
        cycleDuration INTEGER NULL,
        email TEXT NULL,
        profileImage TEXT NULL
      );

      CREATE TABLE IF NOT EXISTS cycles_menstruels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL,
        ovulationDate DATE NOT NULL,
        fecundityPeriodStart DATE NOT NULL,
        fecundityPeriodEnd DATE NOT NULL,
        startMenstruationDate DATE NOT NULL,
        endMenstruationDate DATE NOT NULL,
        nextMenstruationStartDate DATE NOT NULL,
        nextMenstruationEndDate DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS first_time (
        id INTEGER PRIMARY KEY,
        status INTEGER DEFAULT 0
      );
    `);

    await dropLegacyPasswordColumn();
    await addRoleColumn();
    await fixFecundityPeriodEnd();

    return result;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const isFirstLaunch = async () => {
  try {
    let result = await db.getFirstAsync("SELECT * FROM first_time");

    if (!result) {
      await db.runAsync("INSERT INTO first_time (status) VALUES (1);");
      result = { status: 1 };
    } else {
      result = { status: result.status };
    }

    return result;
  } catch (error) {
    return { status: true };
  }
};

export const setFirstLaunchFalse = async () => {
  try {
    const result = await db.runAsync(`
      UPDATE first_time SET status = 0 WHERE id = 1;
    `);
    return result;
  } catch (error) {
    console.error("Error setting first launch flag:", error);
    throw error;
  }
};

export const addCycleMenstruel = async (
  fecundityPeriodEnd,
  fecundityPeriodStart,
  month,
  startMenstruationDate,
  endMenstruationDate,
  nextMenstruationStartDate,
  nextMenstruationEndDate,
  ovulationDate
) => {
  try {
    return await db.runAsync(
      "INSERT INTO cycles_menstruels ( month, ovulationDate, fecundityPeriodStart,startMenstruationDate,endMenstruationDate, fecundityPeriodEnd, nextMenstruationStartDate, nextMenstruationEndDate) VALUES ( ?, ?,?, ?, ?, ?, ?, ?)",
      [
        month,
        ovulationDate,
        fecundityPeriodStart,
        startMenstruationDate,
        endMenstruationDate,
        fecundityPeriodEnd,
        nextMenstruationStartDate,
        nextMenstruationEndDate,
      ]
    );
  } catch (error) {
    console.error("Error adding cycle menstruel:", error);
    throw error;
  }
};

export const addCyclesMenstruels = async (cycles) => {
  await db.withTransactionAsync(async () => {
    for (const cycle of cycles) {
      await db.runAsync(
        "INSERT INTO cycles_menstruels ( month, ovulationDate, fecundityPeriodStart,startMenstruationDate,endMenstruationDate, fecundityPeriodEnd, nextMenstruationStartDate, nextMenstruationEndDate) VALUES ( ?, ?,?, ?, ?, ?, ?, ?)",
        [
          cycle.month,
          cycle.ovulationDate,
          cycle.fecundityPeriodStart,
          cycle.startMenstruationDate,
          cycle.endMenstruationDate,
          cycle.fecundityPeriodEnd,
          cycle.nextMenstruationStartDate,
          cycle.nextMenstruationEndDate,
        ]
      );
    }
  });
};

export const getAllCycle = async () => {
  return db.getAllAsync("SELECT * FROM cycles_menstruels");
};

export const deleteCycleById = async (id) => {
  try {
    return await db.runAsync("DELETE FROM cycles_menstruels WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting cycle:", error);
    throw error;
  }
};
