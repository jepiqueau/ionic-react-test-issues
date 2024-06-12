export const Issue558Upgrade = [
    {
    toVersion: 1,
    statements: [`
        CREATE TABLE IF NOT EXISTS documents (
            taskID TEXT NOT NULL,
            id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            fileType TEXT NOT NULL,
            url TEXT NOT NULL,
            location TEXT
      );
    `]
    },
]
