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

// Sonar Issue: Unused variable
const MAX_USERS = 100;

// Sonar Issue: Magic numbers without explanation
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Sonar Issue: Missing input validation
  const query = 'SELECT * FROM users WHERE id = ' + userId;
  
  db.get(query, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row);
    }
  });
});

// Sonar Issue: Code duplication - similar to /greet route
app.get('/greeting', (req, res) => {
  res.json({ message: 'Hello from the second route!' });
});

// Sonar Issue: More code duplication - duplicate of /greeting and /greet
app.get('/welcome', (req, res) => {
  if (PORT==3000){
    console.log('Here is the welcome route');
  }
  res.json({ message: 'Hello from the second route!' });
});

// Sonar Issue: Another duplicate - nearly identical logic
app.get('/hi', (req, res) => {
  if (PORT===3000){
    console.log('Here is the welcome route');
  }
  res.json({ message: 'Hello from the second route!' });
});

// Sonar Issue: Duplicate with slight variation
app.get('/welcome-message', (req, res) => {
  res.json({ message: 'Hello from the second route!' });
});

// Sonar Issue: Dead code - unreachable after return
app.get('/status', (req, res) => {
  res.json({ status: 'ok' });
  console.log('This line is unreachable');
});

// Sonar Issue: Complex conditional logic with high cognitive complexity
app.get('/validate/:email', (req, res) => {
  const email = req.params.email;
  let isValid = false;
  
  // Sonar Issue: Very complex nested condition with high cognitive complexity (>15)
  if (email) {
    if (email.length > 0) {
      if (email.includes('@')) {
        if (email.includes('.')) {
          if (email.indexOf('@') < email.lastIndexOf('.')) {
            if (email.split('@')[0].length > 0) {
              if (email.split('@')[1] && email.split('@')[1].length > 0) {
                if (email.split('@')[1].includes('.')) {
                  if (email.split('.').length > 1) {
                    if (!email.startsWith('@')) {
                      if (!email.endsWith('@')) {
                        if (!email.endsWith('.')) {
                          if (!email.includes('..')) {
                            if (!/[^a-zA-Z0-9.@_-]/.test(email)) {
                              if (email.split('@').length === 2) {
                                isValid = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  res.json({ email: email, isValid: isValid });
});

// Sonar Issue: Missing error handling
app.get('/data', (req, res) => {
  const testData = JSON.parse(req.query.json);
  res.json({ data: testData });
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/greet', (req, res) => {
  res.json({ message: 'Hello from the second route!' });
});

// WARNING: VULNERABLE to SQL Injection - DO NOT use in production!
// This route demonstrates unsafe string concatenation for educational purposes.
// example: ' OR '1'='1
app.get('/search', (req, res) => {
  const username = req.query.name || '';
  
  // Unsafe query building with string concatenation
  const query = 'SELECT * FROM users WHERE name = \'' + username + '\'';

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message, query: query });
    } else {
      res.json({ 
        query: query,
        results: rows,
        warning: 'UNSAFE - This demonstrates SQL injection vulnerability. Never use string concatenation for building SQL queries in production!'
      });
    }
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
