export const BlobUpgrade = [
    {
    toVersion: 1,
    statements: [
        `CREATE TABLE IF NOT EXISTS d_categories (
            ID INTEGER PRIMARY KEY,
            GUID BLOB,
            label varchar(255) NOT NULL,
            position tinyint(4) NOT NULL,
            deleted BOOLEAN DEFAULT 0
        );`
    ]
    },
    /* add new statements below for next database version when required*/
    /*
    {
    toVersion: 2,
    statements: [
        `ALTER TABLE d_categories ADD COLUMN decription TEXT;`,
    ]
    },
    */
]
