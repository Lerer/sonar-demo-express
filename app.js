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

// Sonar Issue: Memory leak - unbounded array growth
let requestLog = [];

// Sonar Issue: Memory leak - unbounded object cache
const userCache = {};

// Sonar Issue: Unclosed resource - setInterval without cleanup
setInterval(() => {
  console.log('Memory leaking timer without cleanup');
}, 1000);

// Sonar Issue: Global mutable state that grows indefinitely
let globalCounter = 0;

// Sonar Issue: Memory leak - unbounded array growth
app.get('/log-request', (req, res) => {
  globalCounter++;
  requestLog.push({
    timestamp: new Date(),
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    data: new Array(1000).fill('data') // Growing memory usage
  });
  
  res.json({ logged: true, totalRequests: requestLog.length });
});

// Sonar Issue: Memory leak - unbounded cache without eviction policy
app.get('/cache/:key/:value', (req, res) => {
  const key = req.params.key;
  const value = req.params.value;
  
  userCache[key] = {
    value: value,
    timestamp: Date.now(),
    largePayload: new Array(10000).fill(value)
  };
  
  res.json({ cached: true, cacheSize: Object.keys(userCache).length });
});

// Sonar Issue: Unhandled Promise rejection
app.get('/async-issue', (req, res) => {
  // Fire and forget - promise without catch handler
  Promise.resolve().then(() => {
    throw new Error('Unhandled promise rejection');
  });
  
  res.json({ message: 'Request accepted' });
});

// Sonar Issue: Race condition and missing null/undefined checks
app.get('/process/:id', (req, res) => {
  const id = req.params.id;
  let data = null;
  
  // Sonar Issue: Missing error handling for async operation
  setTimeout(() => {
    // Accessing data.value without checking if data is null
    console.log(data.value);
  }, 100);
  
  res.json({ processing: true });
});

// Sonar Issue: Event listener not removed - memory leak
app.get('/subscribe', (req, res) => {
  const listener = () => {
    console.log('Event fired');
  };
  
  // Sonar Issue: Listener added but never removed - accumulates on every request
  app.on('customEvent', listener);
  
  res.json({ subscribed: true });
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
  const currentTime = Date.now
  const testData = JSON.parse(req.query.json);
  res.json({ data: testData });
});

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

// Sonar Issue: Code duplication - ROUTE 1 with duplicated if-else logic
app.get('/transform/:text', (req, res) => {
  let input = req.params.text;
  
  if (input === 'admin') {
    input = 'user';
  } else if (input === 'root') {
    input = 'guest';
  } else {
    input = 'default_value';
  }
  
  res.json({
    original: req.params.text,
    transformed: input,
    message: 'Text has been transformed successfully'
  });
});

// Sonar Issue: Code duplication - ROUTE 2 with EXACT DUPLICATE if-else logic
app.get('/convert/:text', (req, res) => {
  let input = req.params.text;
  
  if (input === 'admin') {
    input = 'user';
  } else if (input === 'root') {
    input = 'guest';
  } else {
    input = 'default_value';
  }
  
  res.json({
    input: req.params.text,
    output: input,
    status: 'conversion_complete'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Routes:`);
  console.log(`  - http://localhost:${PORT}/hello`);
  console.log(`  - http://localhost:${PORT}/greet`);
  console.log(`  - http://localhost:${PORT}/search?name=Alice (safe - parameterized)`);
});
