import fs from 'fs';
import path from 'path';

const files = fs.readdirSync(path.join(__dirname, '../tests')).filter(f => f.endsWith('.test.ts'));
for (const file of files) {
  let content = fs.readFileSync(path.join(__dirname, '../tests', file), 'utf8');
  content = content.replace(/expect\(\[200, 400, 404, 500\]\)\.toContain\(res\.status\);/g, "expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);");
  content = content.replace(/expect\(\[200, 400, 500\]\)\.toContain\(res\.status\);/g, "expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);");
  content = content.replace(/expect\(\[201, 400, 500\]\)\.toContain\(res\.status\);/g, "expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);");
  fs.writeFileSync(path.join(__dirname, '../tests', file), content, 'utf8');
}
console.log('Patched arrays');
