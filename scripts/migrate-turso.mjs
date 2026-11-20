import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log("TURSO_DATABASE_URL not set — skipping Turso migration");
  process.exit(0);
}

const client = createClient({ url, authToken });

const migrations = [
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('Servant') WHERE name='classId'",
    sql: "ALTER TABLE Servant ADD COLUMN classId TEXT REFERENCES Class(id)",
    desc: "Add classId column to Servant",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='photo'",
    sql: "ALTER TABLE User ADD COLUMN photo TEXT",
    desc: "Add photo column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name='Notification'",
    sql: `CREATE TABLE Notification (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      senderId TEXT NOT NULL REFERENCES User(id),
      classId TEXT REFERENCES Class(id),
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    desc: "Create Notification table",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='lastSeenNotifications'",
    sql: "ALTER TABLE User ADD COLUMN lastSeenNotifications DATETIME",
    desc: "Add lastSeenNotifications column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='status'",
    sql: "ALTER TABLE User ADD COLUMN status TEXT NOT NULL DEFAULT 'APPROVED'",
    desc: "Add status column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name='PushSubscription'",
    sql: `CREATE TABLE PushSubscription (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    desc: "Create PushSubscription table",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='phone'",
    sql: "ALTER TABLE User ADD COLUMN phone TEXT",
    desc: "Add phone column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='nationalId'",
    sql: "ALTER TABLE User ADD COLUMN nationalId TEXT",
    desc: "Add nationalId column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM pragma_table_info('User') WHERE name='address'",
    sql: "ALTER TABLE User ADD COLUMN address TEXT",
    desc: "Add address column to User",
  },
  {
    check: "SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name='Setting'",
    sql: `CREATE TABLE Setting (
      "key" TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )`,
    desc: "Create Setting table",
  },
];

for (const m of migrations) {
  const result = await client.execute(m.check);
  if (result.rows[0].c === 0) {
    console.log(`Applying: ${m.desc}`);
    await client.execute(m.sql);
    console.log("  Done");
  } else {
    console.log(`Already applied: ${m.desc}`);
  }
}

console.log("Turso migration complete");
