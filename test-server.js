const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple JSON server for testing
const dbPath = path.join(__dirname, 'db.json');

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [], houses: [], tenants: [], payments: [], expenses: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

function getIdFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

function parseQueryParams(url) {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return {};

  const queryString = url.substring(queryIndex + 1);
  const params = {};

  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return params;
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  const method = req.method;

  console.log(`${method} ${url}`);

  // Parse URL
  const urlParts = url.split('?')[0].split('/').filter(part => part);
  const resource = urlParts[0]; // users, houses, tenants, payments, expenses
  const id = urlParts[1]; // optional ID

  let db = readDB();

  if (!db[resource]) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Resource not found' }));
    return;
  }

  try {
    if (method === 'GET') {
      let data = db[resource];

      // Handle query parameters
      const queryParams = parseQueryParams(url);

      // Filter by query parameters
      Object.keys(queryParams).forEach(key => {
        if (key === '_page' || key === '_limit' || key === '_sort' || key === '_order') {
          // Handle pagination and sorting later if needed
          return;
        }
        data = data.filter(item => item[key] && item[key].toString().includes(queryParams[key]));
      });

      // Handle pagination
      if (queryParams._page && queryParams._limit) {
        const page = parseInt(queryParams._page);
        const limit = parseInt(queryParams._limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        data = data.slice(startIndex, endIndex);

        // Add pagination headers
        res.setHeader('X-Total-Count', db[resource].length);
      }

      if (id) {
        const item = data.find(item => item.id == id);
        if (!item) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Item not found' }));
          return;
        }
        data = item;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));

    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const newItem = JSON.parse(body);
          // Generate ID if not provided
          if (!newItem.id) {
            const maxId = db[resource].length > 0 ? Math.max(...db[resource].map(item => item.id)) : 0;
            newItem.id = maxId + 1;
          }
          db[resource].push(newItem);
          writeDB(db);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newItem));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });

    } else if (method === 'PUT') {
      if (!id) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'ID required for PUT' }));
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const updateData = JSON.parse(body);
          const index = db[resource].findIndex(item => item.id == id);

          if (index === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Item not found' }));
            return;
          }

          db[resource][index] = { ...db[resource][index], ...updateData };
          writeDB(db);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(db[resource][index]));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });

    } else if (method === 'DELETE') {
      if (!id) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'ID required for DELETE' }));
        return;
      }

      const index = db[resource].findIndex(item => item.id == id);
      if (index === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Item not found' }));
        return;
      }

      db[resource].splice(index, 1);
      writeDB(db);

      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));

    } else {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = 3006;
server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET    /users`);
  console.log(`   GET    /houses`);
  console.log(`   GET    /tenants`);
  console.log(`   GET    /payments`);
  console.log(`   GET    /expenses`);
  console.log(`   POST   /users, /houses, /tenants, /payments, /expenses`);
  console.log(`   PUT    /users/:id, /houses/:id, /tenants/:id, /payments/:id, /expenses/:id`);
  console.log(`   DELETE /users/:id, /houses/:id, /tenants/:id, /payments/:id, /expenses/:id`);
  console.log(`\n💾 Data stored in: ${dbPath}`);
});