export const MultiplerowsUpgrade = [
    {
    toVersion: 1,
    statements: [`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER
      );
    CREATE INDEX IF NOT EXISTS contacts_index_email ON contacts (email);
    `]
    },
]
