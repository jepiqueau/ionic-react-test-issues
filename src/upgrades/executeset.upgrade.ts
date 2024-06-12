export const ExecuteSetUpgrade = [
    {
      toVersion: 1,
      statements: [`
      CREATE TABLE projects (
        identity INTEGER PRIMARY KEY AUTOINCREMENT,
        _state_ TEXT NULL,
        Id INTEGER NULL,
        project_name TEXT NULL,
        full_reference TEXT NULL,
        latitude INTEGER NULL,
        longitude INTEGER NULL,
        number_name TEXT NULL,
        project_open INTEGER NULL,
        updated_at TEXT NULL,
        deleted_at TEXT NULL );
      `]
    },
]
