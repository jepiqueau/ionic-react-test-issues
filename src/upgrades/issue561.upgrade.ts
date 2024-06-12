export const Issue561Upgrade = [
    {
    toVersion: 1,
    statements: [`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            sql_deleted BOOLEAN DEFAULT 0 CHECK (sql_deleted IN (0, 1)),
            last_modified INTEGER DEFAULT (strftime('%s', 'now')),
            UNIQUE (last_name, first_name)
        );
        CREATE TRIGGER IF NOT EXISTS users_trigger_last_modified
        AFTER UPDATE ON users
        FOR EACH ROW
        BEGIN
            UPDATE users
            SET last_modified = strftime('%s', 'now')
            WHERE id = OLD.id;
        END;
    `]
    },
]
