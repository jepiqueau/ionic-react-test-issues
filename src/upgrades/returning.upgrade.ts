export const ReturningUpgrade = [
    {
    toVersion: 1,
    statements: [`
    CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    CREATE INDEX IF NOT EXISTS test_index_email ON test (email);
    `]
    },
]
