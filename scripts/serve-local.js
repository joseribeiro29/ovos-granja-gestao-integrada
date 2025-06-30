
const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const port = 3000;
const distPath = path.join(__dirname, '../dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = `${distPath}${parsedUrl.pathname}`;

  // If pathname is directory, serve index.html
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  // If file doesn't exist, serve index.html (for SPA routing)
  if (!fs.existsSync(pathname)) {
    pathname = path.join(distPath, 'index.html');
  }

  const ext = path.parse(pathname).ext;
  const mimeType = mimeTypes[ext] || 'text/html';

  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end(`Arquivo não encontrado: ${pathname}`);
      return;
    }

    res.setHeader('Content-type', mimeType);
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`🚀 Sistema de Gestão Avícola rodando em:`);
  console.log(`   http://localhost:${port}`);
  console.log(`\n💡 Para instalar como PWA:`);
  console.log(`   1. Abra o link acima no Chrome ou Edge`);
  console.log(`   2. Clique no ícone de "instalar" na barra de endereços`);
  console.log(`   3. A aplicação será instalada como um app do Windows`);
  console.log(`\n⏹️  Para parar o servidor: Ctrl+C`);
});
