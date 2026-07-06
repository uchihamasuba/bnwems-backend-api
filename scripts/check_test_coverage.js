const fs = require('fs');
const path = require('path');
const glob = require('glob'); // npm install glob if needed, but wait I can use fs.readdirSync recursively
// actually it's easier to just use standard fs functions

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else if (filePath.endsWith('.ts')) {
      files.push(filePath);
    }
  }
  return files;
}

const routeFiles = getFiles('src/routes');
const testFiles = getFiles('tests');

let routeCount = 0;
let testCount = 0;
const routeEndpoints = new Set();
const testEndpoints = new Set();

const methodRegex = /router\.(get|post|put|patch|delete)\(['"](.*?)['"]/g;
for (const file of routeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    let method = match[1].toUpperCase();
    let routePath = match[2];
    const baseRoute = path.basename(file, '.route.ts');
    let fullRoute = `/api/v1/${baseRoute}${routePath}`.replace(/\/+/g, '/').replace(/\/$/, '');
    if (fullRoute === `/api/v1/${baseRoute}`) {
      // some routes are just /api/v1/resource
    }
    // Try to normalize it a bit for testing
    if (baseRoute === 'index' || baseRoute === 'operations') continue; // Skip index and operations (mobile mapped separately)
    routeEndpoints.add(`${method} ${fullRoute}`);
    routeCount++;
  }
}

// Special case for operations route mapped as mobile
const operationsContent = fs.readFileSync('src/routes/operations.route.ts', 'utf8');
let matchOps;
while ((matchOps = methodRegex.exec(operationsContent)) !== null) {
  let method = matchOps[1].toUpperCase();
  let routePath = matchOps[2];
  let fullRoute = `/api/v1${routePath}`.replace(/\/+/g, '/').replace(/\/$/, '');
  routeEndpoints.add(`${method} ${fullRoute}`);
  routeCount++;
}


const testRegex = /(?:describe|it)\(['"](GET|POST|PUT|PATCH|DELETE) (.*?)['"]/g;
for (const file of testFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = testRegex.exec(content)) !== null) {
    let method = match[1];
    let routePath = match[2].replace(/\/+/g, '/').replace(/\/$/, '');
    testEndpoints.add(`${method} ${routePath}`);
    testCount++;
  }
}

console.log(`Found ${routeCount} route definitions and ${testCount} test descriptions`);

const missing = [];
for (const route of routeEndpoints) {
  if (!testEndpoints.has(route)) {
    missing.push(route);
  }
}

console.log(`Missing tests for ${missing.length} endpoints:`);
console.log(missing.join('\n'));

