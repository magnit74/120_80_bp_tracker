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
  return jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '20m',
    issuer: issuerId,
    header: { alg: 'ES256', kid: keyId, typ: 'JWT' }
  });
}

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const options = {
      hostname: 'api.appstoreconnect.apple.com',
      path: path,
      method: method,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (data) resolve(JSON.parse(data));
        else resolve({});
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log('Fetching Bundle ID for com.magnit74.bptracker...');
    const bundleRes = await makeRequest('/v1/bundleIds?filter[identifier]=com.magnit74.bptracker');
    if (bundleRes.errors) {
      console.error('Error fetching bundle:', bundleRes.errors);
      return;
    }
    const internalId = bundleRes.data[0].id;
    console.log('Found internal Bundle ID:', internalId);
    
    console.log('Checking existing capabilities...');
    const capRes = await makeRequest(`/v1/bundleIds/${internalId}/bundleIdCapabilities`);
    const existing = capRes.data || [];
    const hasPush = existing.some(c => c.attributes.capabilityType === 'PUSH_NOTIFICATIONS');
    if (hasPush) {
      console.log('Push Notifications are already enabled!');
    } else {
      console.log('Enabling Push Notifications...');
      const reqBody = {
        data: {
          type: "bundleIdCapabilities",
          attributes: { capabilityType: "PUSH_NOTIFICATIONS" },
          relationships: {
            bundleId: { data: { type: "bundleIds", id: internalId } }
          }
        }
      };
      const enableRes = await makeRequest('/v1/bundleIdCapabilities', 'POST', reqBody);
      if (enableRes.errors) console.error('Failed to enable push:', enableRes.errors);
      else console.log('Push Notifications enabled successfully!');
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}
run();
