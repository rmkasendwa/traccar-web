import http from 'node:http';
import next from 'next';
import httpProxy from 'http-proxy';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST ?? '0.0.0.0';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8082';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const proxy = httpProxy.createProxyServer({
  target: backendUrl,
  changeOrigin: true,
  ws: true,
});

proxy.on('error', (error, request, response) => {
  console.error('Backend proxy error:', error.message);
  if (response && 'writeHead' in response && !response.headersSent) {
    response.writeHead(502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Backend is unavailable' }));
  }
});

await app.prepare();

const server = http.createServer((request, response) => {
  if (request.url?.startsWith('/api/')) {
    proxy.web(request, response);
  } else {
    handle(request, response);
  }
});

server.on('upgrade', (request, socket, head) => {
  if (request.url?.startsWith('/api/')) {
    proxy.ws(request, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(port, hostname, () => {
  console.log(`Traccar Web listening on http://${hostname}:${port}`);
  console.log(`Proxying /api to ${backendUrl}`);
});
