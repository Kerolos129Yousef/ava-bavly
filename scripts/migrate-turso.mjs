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
