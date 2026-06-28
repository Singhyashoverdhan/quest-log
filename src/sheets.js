const SHEET_ID     = "1yhxYC2dxz7xC2h_kvf-6Hd25ASxOv6AI9YHlVEyOc0Q";
const CLIENT_EMAIL = "questlog-app@questlog-500609.iam.gserviceaccount.com";
const PRIVATE_KEY  = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDbhCnsID5BUt4N
gs9X9+Bx/IGpRRJmkT6wAjdIRoKMtot66Lv7pFZLxa02+Q/hgrWSigfDGurvfp+o
NikobbxVkX9cpQ+mZtrHvA6z6j6gzBd82mQrk6n3QJNIr4OJjSB42iYGsqX86noz
gI5YlKZhyvfe8vTrPfgR2xbnUQfe/Ox9keICatHfEIGAhCZHMdUo4UifvJ/fI/Mk
UthAPTnQjD3WLeE9pVZIL5Ajzbor2w9rwSGN/o4LwMerVUunpdOELcDKI8jFqPKJ
0i6NJ0IDpdQFy3x8rhnooIB0R/yPV6XT0FZ19Lw46F2z+RFSzaesOSlQdVnY4J+5
bx+aceV9AgMBAAECggEAEqdDbLY8tA5XoixIdEAzCVycpAajjqWu/wPhMLoVI+Hr
LlGSj8qiLqQomPBHIjGaPk6OZEzoQ9uts3yOuMnCZD8N5JB+KPS6iJh5Y153XfCZ
2lkwg+dzXPhWy6lmcwzUApD/BDiwFDLUmYXGEs7m6I53y7E3kLneV54XbyaalZ8e
JBxsqlpX0sDsDqG9ZrN19IxQFpeI8VLphSL99BVrKfg9sZl/u4GHw2M7d718TNZN
d1lUOiEJYTknCg/BDHbPr8Nsbeno3Fj7PNHKLI7MkB3HnO2SoSFqa/d04ovu5/u1
eixyj/hrdSNzf5Q3rx/ikkVeyYf3gBjkMwQGmLQZ3QKBgQD2SJrvRDsSoKJ4RF1B
hcWlMZbvtWcmfQxjHViTtK/DmON91f1P+KOk1e1rs3AUsWsSk+SM76CL7SlT5eQT
74KFvWreAAQ8A9VDOH5kfVcC0ZjQoVkC27+NpGxJZ4HG3ed6+oAXezcdD4uaIxQx
71cFNdsVtrPEJmFcLbTjbzTyVwKBgQDkLTdEzrBcCfH5oEf9VB2BMT6kWr6sDBdX
BhSmUTN9UyE/5KVEUVBs3V2jZ+jiR7TJ+MjhIrL7KpCjBG3Plwv9oF9PB8w4Bl+h
/vM1kRQu4Wfn6p8VzFMCnk7uAWHild/lcQOJSq5i6rYNTGnk45kgCrYao2vCd8bq
XuXJB5SKSwKBgQDVLwn2HPCpciTQyBSVOA9arC9D9ZmBRnMnhGp9CMWwITKiZU4t
IEO+1nL6bEuTjfPqE9ydZntpQ/QnLHMeEo+/5rOP0SHZNVQwKMG3iIt95CJMTa33
/HG2UOJvM8qxcroByL6CFOUjIaas2LqNcui3mOO4yvqWysYx/Vp8GHITZwKBgQCX
4wVcVx2MVs5tNWVWW2y8d/RT4Vf1HKNYuWJ7h6f3r6N9bY0ZmesoXH6dbGjYX5UX
sPS+8KMlkCLxcNxMCCbiMKPg7rbhQFTed+CbcrR1tHO/LC2zi+xh3NF7mw32j3+X
spABDuZgUA7ZcVk4FMz0SE0KFGiB7ctKbdsV42bcWwKBgQCH90zTCCzZ14+P5gub
MyFDBE5yuj6OvTfubIt1QYDIweg2aAQC3127FqjTqGQAn2GQJAs0iK0Xgu8WgGzT
BZ6Pzuka/lDIGRpM2Xq2qpf2Y5LoI43tRFDBWmwYrG91/0Do4GouQL6QCz9fpqH9
TkkpzpfJOacQpiHeDtK34FRKNQ==
-----END PRIVATE KEY-----`;

let _tok = null;

export async function getToken() {
  if (_tok && _tok.exp > Date.now() / 1000 + 60) return _tok.t;
  const now = Math.floor(Date.now() / 1000);
  const enc = o => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const h = enc({ alg: 'RS256', typ: 'JWT' });
  const c = enc({ iss: CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now });
  const u = `${h}.${c}`;
  const pem = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const bin = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', bin.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(u));
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${u}.${s}` });
  const d = await r.json();
  _tok = { t: d.access_token, exp: now + 3600 };
  return d.access_token;
}

export async function readSheet(tab) {
  const t = await getToken();
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}`, { headers: { Authorization: `Bearer ${t}` } });
  return (await r.json()).values || [];
}

export async function appendRow(tab, vals) {
  const t = await getToken();
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}:append?valueInputOption=USER_ENTERED`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [vals] }) });
}
