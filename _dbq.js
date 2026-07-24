const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('D:/mimocode/data/mimocode/mimocode.db', {readOnly: true});
const q = process.argv[2];
const args = process.argv.slice(3);
try {
  const stmt = db.prepare(q);
  const r = stmt.all(...args);
  console.log(JSON.stringify(r.map(row => {
    const out = {...row};
    for (const k in out) {
      if (typeof out[k] === 'string' && out[k].length > 500) out[k] = out[k].substring(0, 500) + '...';
    }
    return out;
  }), null, 2));
} catch(e) {
  console.error(e.message);
}
db.close();
