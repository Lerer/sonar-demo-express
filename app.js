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

// WARNING: VULNERABLE to SQL Injection - DO NOT use in production!
// This route demonstrates unsafe string concatenation for educational purposes.
app.get('/search', (req, res) => {
  const username = req.query.name || '';
  
  // Unsafe query building with string concatenation
  const query = 'SELECT * FROM users WHERE name = \'' + username + '\'';
  
  res.json({
    query: query,
    warning: 'This demonstrates SQL Injection vulnerability - never do this in production!'
  });
});

// Safe version using parameterized queries (recommended)
app.get('/search-safe', (req, res) => {
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
        note: 'This is the safe approach using parameterized queries'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Routes:`);
  console.log(`  - http://localhost:${PORT}/hello`);
  console.log(`  - http://localhost:${PORT}/greet`);
  console.log(`  - http://localhost:${PORT}/search?name=Alice (vulnerable - string concat)`);
  console.log(`  - http://localhost:${PORT}/search-safe?name=Alice (safe - parameterized)`);
});
