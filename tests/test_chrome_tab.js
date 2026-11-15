const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

async function main() {
  console.log('Launching Headless Chrome...');
  const chrome = spawn('/home/ermizamr/.local/bin/google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:8080/pages/concept-with-navigation.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  function getPage() {
    return new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          const list = JSON.parse(d);
          const p = list.find(x => x.url.includes('concept-with-navigation.html'));
          if (p) resolve(p);
          else reject(new Error('Page not found'));
        });
      }).on('error', reject);
    });
  }

  const page = await getPage();
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  await new Promise((resolve) => ws.on('open', resolve));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.id === id) {
          ws.off('message', handler);
          resolve(parsed.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Evaluate script to dismiss onboarding modal if open
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('savanna_a11y_profile', JSON.stringify({ configured: true, skipped: true }));
      const backdrop = document.getElementById('savanna-a11y-backdrop');
      if (backdrop) backdrop.setAttribute('hidden', '');
    `
  });

  await new Promise(r => setTimeout(r, 500));

  // Focus directly onto VA-Content-Banner image
  const focusRes = await send('Runtime.evaluate', {
    expression: `
      const img = document.querySelector('img[src*="VA-Content-Banner"]');
      if (img) img.focus();
      ({
        focusedTag: document.activeElement ? document.activeElement.tagName : 'NONE',
        src: document.activeElement ? document.activeElement.getAttribute('src') : null,
        tabIndex: document.activeElement ? document.activeElement.tabIndex : null
      });
    `,
    returnByValue: true
  });
  console.log('1. Initial focus state:', JSON.stringify(focusRes));

  // Send Tab key event via CDP
  console.log('\n2. Sending Tab key press via CDP...');
  await send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });

  await new Promise(r => setTimeout(r, 200));

  const afterTab1 = await send('Runtime.evaluate', {
    expression: `
      ({
        activeTag: document.activeElement ? document.activeElement.tagName : 'NONE',
        className: document.activeElement ? document.activeElement.className : '',
        id: document.activeElement ? document.activeElement.id : '',
        text: document.activeElement ? (document.activeElement.innerText || document.activeElement.getAttribute('aria-label') || '').slice(0, 50) : '',
        src: document.activeElement ? document.activeElement.getAttribute('src') : null
      });
    `,
    returnByValue: true
  });
  console.log('After Tab 1:', JSON.stringify(afterTab1));

  // Send another Tab key event
  console.log('\n3. Sending second Tab key press via CDP...');
  await send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });

  await new Promise(r => setTimeout(r, 200));

  const afterTab2 = await send('Runtime.evaluate', {
    expression: `
      ({
        activeTag: document.activeElement ? document.activeElement.tagName : 'NONE',
        className: document.activeElement ? document.activeElement.className : '',
        id: document.activeElement ? document.activeElement.id : '',
        text: document.activeElement ? (document.activeElement.innerText || document.activeElement.getAttribute('aria-label') || '').slice(0, 50) : '',
        src: document.activeElement ? document.activeElement.getAttribute('src') : null
      });
    `,
    returnByValue: true
  });
  console.log('After Tab 2:', JSON.stringify(afterTab2));

  // Send third Tab key event
  console.log('\n4. Sending third Tab key press via CDP...');
  await send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    key: 'Tab',
    code: 'Tab'
  });

  await new Promise(r => setTimeout(r, 200));

  const afterTab3 = await send('Runtime.evaluate', {
    expression: `
      ({
        activeTag: document.activeElement ? document.activeElement.tagName : 'NONE',
        className: document.activeElement ? document.activeElement.className : '',
        id: document.activeElement ? document.activeElement.id : '',
        text: document.activeElement ? (document.activeElement.innerText || document.activeElement.getAttribute('aria-label') || '').slice(0, 50) : '',
        src: document.activeElement ? document.activeElement.getAttribute('src') : null
      });
    `,
    returnByValue: true
  });
  console.log('After Tab 3:', JSON.stringify(afterTab3));

  ws.close();
  chrome.kill();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
