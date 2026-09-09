// StatiCrypt payload crypto with a pre-hashed key. Format: hmac_hex(64) || iv_hex(32) || ct_hex
const crypto = require('crypto'); const fs = require('fs');
const HP = process.env.HP; // hashedPassword hex
function decrypt(payload) {
  const hmac = payload.slice(0, 64), body = payload.slice(64);
  const check = crypto.createHmac('sha256', Buffer.from(HP, 'hex')).update(body).digest('hex');
  if (check !== hmac) throw new Error('HMAC mismatch: wrong key');
  const iv = Buffer.from(body.slice(0, 32), 'hex'), ct = Buffer.from(body.slice(32), 'hex');
  const d = crypto.createDecipheriv('aes-256-cbc', Buffer.from(HP, 'hex'), iv);
  return Buffer.concat([d.update(ct), d.final()]).toString('utf8');
}
function encrypt(plain) {
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv('aes-256-cbc', Buffer.from(HP, 'hex'), iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]).toString('hex');
  const body = iv.toString('hex') + ct;
  return crypto.createHmac('sha256', Buffer.from(HP, 'hex')).update(body).digest('hex') + body;
}
const [,, mode, a, b] = process.argv;
const re = /("staticryptEncryptedMsgUniqueVariableName"\s*:\s*")([0-9a-f]+)(")/;
if (mode === 'decrypt') { const html = fs.readFileSync(a, 'utf8'); const m = html.match(re); fs.writeFileSync(b, decrypt(m[2])); console.log('decrypted', b); }
else if (mode === 'encrypt') { const shell = fs.readFileSync(a, 'utf8'); const plain = fs.readFileSync(b, 'utf8'); const out = shell.replace(re, (_, p, __, s) => p + encrypt(plain) + s); fs.writeFileSync(process.argv[5], out); const rt = decrypt(out.match(re)[2]); console.log('encrypted; roundtrip', rt === plain ? 'OK' : 'FAIL'); }
