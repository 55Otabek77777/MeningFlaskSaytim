// node harness.mjs <PORT> — server.py oʻrnini bosuvchi HTTP server: /api/* → js/turnir.js, qolgani → static/
// Muhit: ADMIN_PIN (standart 1234), RESULT_HOLD (soniya, standart 12), NAMES_FILE (oquvchilar.txt formatida)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer, parseNames, urlPath, rstripSlash, isApiGet, errorPage } from './turnir.js';

const PORT = parseInt(process.argv[2] || process.env.PORT || '8000', 10);
const STATIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'static');
const PAGES = { '/': 'index.html', '/admin': 'admin.html', '/taxta': 'taxta.html' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.ico': 'image/vnd.microsoft.icon', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf' };

function lanIps() {
  const ips = new Set();
  for (const list of Object.values(os.networkInterfaces())) for (const a of list || []) if (a.family === 'IPv4' || a.family === 4) ips.add(a.address);
  const out = [...ips].filter(ip => !ip.startsWith('127.')).sort();
  return out.length ? out : ['127.0.0.1'];
}

const players = process.env.NAMES_FILE && fs.existsSync(process.env.NAMES_FILE) ? parseNames(fs.readFileSync(process.env.NAMES_FILE, 'utf8')) : { B: [], G: [] };
const srv = createServer({
  pin: process.env.ADMIN_PIN || '1234',
  resultHold: +(process.env.RESULT_HOLD || 12),
  players,
  lan: lanIps().map(ip => `http://${ip}:${PORT}`)
});

function send(res, status, headers, data) {
  res.writeHead(status, { Server: 'MirzoUlugbekShaxmat/1.0', ...headers, 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}
function sendError(res, code, message, explain) {
  send(res, code, { 'Content-Type': 'text/html;charset=utf-8', Connection: 'close' }, errorPage(code, message, explain));
}
function sendResult(req, res, r) {
  if (r.crash) { req.socket.destroy(); return; }        // Python: ushlanmagan xato — ulanish javobsiz uziladi
  const data = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
  send(res, r.status, { 'Content-Type': r.contentType, ...(r.headers || {}) }, data);
}

function serveStatic(res, p) {
  if (/^\/taxta\/\p{Nd}+(\/(oq|qora))?$/u.test(p)) p = '/taxta';
  const fn = Object.prototype.hasOwnProperty.call(PAGES, p) ? PAGES[p] : p.replace(/^\/+/, '');
  const file = path.normalize(path.join(STATIC, fn));
  let ok = file.startsWith(STATIC);
  try { ok = ok && fs.statSync(file).isFile(); } catch { ok = false; }
  if (!ok) return sendError(res, 404, 'Not Found', 'Nothing matches the given URI');
  const data = fs.readFileSync(file);
  const ext = path.extname(file);
  const type = (MIME[ext] || MIME[ext.toLowerCase()] || 'application/octet-stream') + (/\.(html|js|css)$/.test(file) ? '; charset=utf-8' : '');
  res.writeHead(200, { Server: 'MirzoUlugbekShaxmat/1.0', 'Content-Type': type, 'Cache-Control': 'no-cache', 'Content-Length': data.length });
  res.end(data);
}

http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const p = rstripSlash(urlPath(req.url)) || '/';
      if (isApiGet(p)) return sendResult(req, res, await srv.request('GET', req.url, undefined, req.headers));
      return serveStatic(res, p);
    }
    if (req.method === 'POST') {
      const n = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : 0;
      const chunks = [];
      for await (const c of req) chunks.push(c);
      let body = {};
      if (n) {
        let txt = Buffer.concat(chunks).toString('utf8');
        if (txt.startsWith('﻿')) txt = txt.slice(1);
        try { body = JSON.parse(txt || '{}'); } catch { return send(res, 400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, JSON.stringify({ error: 'Soʻrov notoʻgʻri' })); }
      }
      return sendResult(req, res, await srv.request('POST', req.url, body, req.headers));
    }
    req.resume();
    sendError(res, 501, `Unsupported method ('${req.method}')`, 'Server does not support this operation');
  } catch (e) {
    console.error('harness xatosi:', e);
    req.socket.destroy();
  }
}).listen(PORT, '0.0.0.0', () => console.log(`harness: http://localhost:${PORT}/  (PIN ${process.env.ADMIN_PIN || '1234'})`));
