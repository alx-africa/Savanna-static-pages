const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 200000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function createGeminiAudio(request, response) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, { error: 'GEMINI_API_KEY is not configured on the local server.' });
    return;
  }

  let input;
  try {
    input = JSON.parse(await readBody(request));
  } catch {
    sendJson(response, 400, { error: 'Request must contain valid JSON.' });
    return;
  }
  if (typeof input.text !== 'string' || !input.text.trim()) {
    sendJson(response, 400, { error: 'Text to read is required.' });
    return;
  }
  if (input.text.length > 12000) {
    sendJson(response, 400, { error: 'Text to read must be 12,000 characters or fewer.' });
    return;
  }

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: input.text,
              speech_metadata: {
                style: input.language === 'am-ET'
                  ? 'Read this verbatim in clear, natural Amharic (አማርኛ).'
                  : 'Read this verbatim in a clear, accessible voice.'
              }
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { voice: 'Kore' } }
          }
        })
      }
    );
    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      sendJson(response, geminiResponse.status, { error: result.error?.message || 'Gemini TTS request failed.' });
      return;
    }
    const audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!audio?.data) {
      sendJson(response, 502, { error: 'Gemini returned no audio.' });
      return;
    }
    sendJson(response, 200, { audio: audio.data, mimeType: audio.mimeType || 'audio/wav' });
  } catch (error) {
    sendJson(response, 502, { error: `Gemini TTS is unavailable: ${error.message}` });
  }
}

function serveFile(request, response) {
  const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = requested === '/' ? '/pages/profile.html' : requested;
  const filePath = path.resolve(root, `.${relative}`);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/gemini-tts') {
    createGeminiAudio(request, response);
    return;
  }
  if (request.method === 'GET') {
    serveFile(request, response);
    return;
  }
  response.writeHead(405);
  response.end('Method not allowed');
}).listen(port, () => {
  console.log(`Savanna profile server running at http://localhost:${port}`);
});
