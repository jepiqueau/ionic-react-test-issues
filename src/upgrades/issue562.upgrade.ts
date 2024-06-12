export const Issue562Upgrade = [
    {
    toVersion: 1,
    statements: [`
        CREATE TABLE IF NOT EXISTS test562 (
            id TEXT PRIMARY KEY NOT NULL,
            someColumn TEXT NOT NULL,
            body TEXT NOT NULL
            );
        `]
    },
]
