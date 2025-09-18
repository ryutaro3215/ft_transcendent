// plugins/sqlite.ts
import Database from "better-sqlite3";
import fp from "fastify-plugin";

export default fp(async (app) => {
  const db = new Database("data/app.db");
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      imageUrl TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
    END;
  `);

  db.exec(`
		CREATE TABLE IF NOT EXISTS refresh_tokens (
		  jti        TEXT PRIMARY KEY,                 
		  user_id    INTEGER NOT NULL,
		  expires_at INTEGER NOT NULL,                 
		  revoked    INTEGER NOT NULL DEFAULT 0,       
		  replaced_by TEXT, 
		  created_at INTEGER NOT NULL,                 
		  user_agent TEXT,
		  ip         TEXT,
		  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
		
		CREATE INDEX IF NOT EXISTS idx_refresh_user          ON refresh_tokens(user_id);
		CREATE INDEX IF NOT EXISTS idx_refresh_valid_by_user ON refresh_tokens(user_id, revoked, expires_at);
`);

  app.decorate("db", db);
  app.addHook("onClose", async () => {
    db.close();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    db: Database.Database;
  }
}
