export const CommentUpgrade = [
    {
    toVersion: 1,
    statements: [`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY NOT NULL, -- testing
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            FirstName TEXT,
            company TEXT,
            size REAL,
            age INTEGER,
            MobileNumber TEXT
        );
        CREATE INDEX IF NOT EXISTS contacts_index_name ON contacts (name);
        CREATE INDEX IF NOT EXISTS contacts_index_email ON contacts (email);
    `]
    },
/*
    {
    toVersion: 2,
    statements: [`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY NOT NULL,
            contactid INTEGER, -- key to contacts(id)
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            last_modified INTEGER DEFAULT (strftime('%s', 'now')),
            FOREIGN KEY (contactid) REFERENCES contacts(id) ON DELETE SET DEFAULT
        );
        CREATE INDEX IF NOT EXISTS messages_index_name ON messages (title);
        CREATE INDEX IF NOT EXISTS messages_index_last_modified ON messages (last_modified);
    `]
    },
    */
]
