const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)`);
  db.run(`INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')`);
  db.run(`INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com')`);
});
app.disable("x-powered-by");

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/greet', (req, res) => {
  res.json({ message: 'Hello from the second route!' });
});

// Safe version using parameterized queries (recommended)
app.get('/search', (req, res) => {
  const username = req.query.name || '';
  
  // Safe approach using parameterized query
  const query = 'SELECT * FROM users WHERE name = ?';
  
  db.all(query, [username], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ 
        query: query,
        results: rows,
        note: 'Using safe parameterized queries'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Routes:`);
  console.log(`  - http://localhost:${PORT}/hello`);
  console.log(`  - http://localhost:${PORT}/greet`);
  console.log(`  - http://localhost:${PORT}/search?name=Alice (safe - parameterized)`);
});
