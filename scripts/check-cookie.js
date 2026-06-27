'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(process.argv[2] || 'account.txt');

function parseCookieContent(content) {
  const raw = String(content || '').trim();
  const cookies = {};
  let format = 'unknown';

  const add = (name, value) => {
    name = String(name || '').trim();
    value = String(value || '').trim();
    if (name && value) cookies[name] = value;
  };

  if (!raw) return { cookies, format: 'empty' };

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#') && !t.startsWith('#HttpOnly_')) continue;
    const parts = t.split('\t');
    if (parts.length >= 7) {
      format = 'netscape';
      add(parts[5], parts.slice(6).join('\t'));
    }
  }

  if (!Object.keys(cookies).length) {
    format = raw.toLowerCase().startsWith('cookie:') ? 'cookie-header-with-prefix' : 'cookie-header';
    const header = raw.replace(/^cookie:\s*/i, '').replace(/\r?\n/g, '; ');
    for (const pair of header.split(';')) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      add(pair.slice(0, idx), pair.slice(idx + 1));
    }
  }

  return { cookies, format };
}

if (!fs.existsSync(file)) {
  console.error(`❌ File not found: ${file}`);
  process.exit(1);
}

const { cookies, format } = parseCookieContent(fs.readFileSync(file, 'utf8'));
const keys = Object.keys(cookies);
const required = ['sessionid', 'csrftoken', 'ds_user_id'];
const missing = required.filter(k => !cookies[k]);

console.log(`Cookie file: ${file}`);
console.log(`Format: ${format}`);
console.log(`Keys found: ${keys.length ? keys.join(', ') : '(none)'}`);

if (missing.length) {
  console.error(`❌ Missing required cookie(s): ${missing.join(', ')}`);
  console.error('Export a fresh FULL Instagram cookie and paste it into account.txt. Do not paste only sessionid.');
  process.exit(1);
}

console.log('✅ Cookie shape looks OK. If Instagram still says login_required/not authorized, the cookie is expired or checkpointed.');
