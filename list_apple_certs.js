const jwt = require('jsonwebtoken');
const https = require('https');

const issuerId = 'a491de3f-41be-43b6-a6bf-2df739b193ae';
const keyId = 'A4346L7NJ5';
const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg08w+VEBdASW5bzeA
dPvCLW+pCYlVAE+bASlk9Q8vqDGgCgYIKoZIzj0DAQehRANCAATSSxXx2WJPaete
w9HUFMGrGOdoFgtQZvS0E1blUiNYH5xDryyj3J8W0oMBzwfjd6n8N7xAynT23UHW
j0rdc+E2
-----END PRIVATE KEY-----`;

function getToken() {
  return jwt.sign({ aud: 'appstoreconnect-v1' }, privateKey, {
    algorithm: 'ES256',
    expiresIn: '20m',
    issuer: issuerId,
    header: {
      alg: 'ES256',
      kid: keyId,
      typ: 'JWT'
    }
  });
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Fetching certificates...');
  const certs = await makeRequest('/v1/certificates');
  if (certs.errors) {
    console.error('Errors:', certs.errors);
    return;
  }
  const data = certs.data;
  console.log(`Found ${data.length} certificates.`);
  data.forEach(c => {
    console.log(`- ID: ${c.id}, Type: ${c.attributes.certificateType}, Name: ${c.attributes.name}, Exp: ${c.attributes.expirationDate}`);
  });
}

run().catch(console.error);
