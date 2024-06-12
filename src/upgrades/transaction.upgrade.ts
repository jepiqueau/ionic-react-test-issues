export const TransactionUpgrade = [
    {
    toVersion: 1,
    statements: [`
    CREATE TABLE IF NOT EXISTS DemoTable (
      name TEXT ,
      score INTEGER
      );
    `]
    },
    {
    toVersion: 2,
    statements: [`
    CREATE TABLE IF NOT EXISTS accounts(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ain TEXT NOT NULL,
      customerName TEXT,
      openingDate TEXT,
      balance NUMERIC NOT NULL,
      cin TEXT,
      schemeCode TEXT,
      categoryCode TEXT,
      phoneNo TEXT,
      email TEXT,
      bankName TEXT,
      bankCode TEXT,
      bankRecieptName TEXT,
      branchName TEXT,
      branchCode,
      branchRecieptName TEXT,
      bin TEXT,
      lin TEXT,
      loanAmount NUMERIC,
      accountName TEXT,
      isLoan INT NOT NULL,
      nain TEXT,
      groupNo TEXT,
      closingBalanceDate TEXT,
      lastTransactionDate TEXT
      );
    `,
    `CREATE TABLE IF NOT EXISTS logs(
      id INTEGER PRIMARY KEY,
      lastUpdatedDate TEXT NOT NULL);
    `
    ]
    }
]
