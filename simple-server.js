import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  const url = req.url.split('?')[0]; // Remove query params
  const filePath = join(__dirname, 'dist', url === '/' ? 'index.html' : url);
  
  // Handle SPA routes - if it's not a static file, serve index.html
  if (url.startsWith('/game') || url.startsWith('/tags') || (!extname(filePath) && !existsSync(filePath))) {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const content = readFileSync(indexPath);
    console.log(`Serving index.html for SPA route: ${req.url}`);
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
    return;
  }
  
  // Check if file exists
  if (existsSync(filePath) && extname(filePath)) {
    // Serve static file
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = ext === '.html' ? 'text/html' : 
                      ext === '.css' ? 'text/css' : 
                      ext === '.js' ? 'application/javascript' : 'text/plain';
    
    console.log(`Serving static file: ${filePath} with content-type: ${contentType}`);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  } else {
    // Serve index.html for SPA routing
    const indexPath = join(__dirname, 'dist', 'index.html');
    const content = readFileSync(indexPath);
    console.log(`Serving index.html for SPA routing: ${req.url}`);
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
