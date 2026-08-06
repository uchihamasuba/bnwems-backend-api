const fs = require('fs');
const path = require('path');

const apiDocsPath = path.join(__dirname, '../documents/docs/api');
const routesPath = path.join(__dirname, '../src/routes');

// Parse markdown to get all endpoints
function getEndpointsFromDocs() {
  const endpoints = [];
  const files = fs.readdirSync(apiDocsPath).filter(f => f.endsWith('.md') && f !== 'README.md');
  for (const file of files) {
    const content = fs.readFileSync(path.join(apiDocsPath, file), 'utf-8');
    // Match endpoint lines like: | UC-1 | Đăng nhập | `POST /auth/login` |
    // or standalone: `POST /auth/login`
    const regex = /(GET|POST|PUT|PATCH|DELETE)\s+(\/[-a-zA-Z0-9_/{}]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      endpoints.push({ file, method: match[1], path: match[2].replace(/\{id\}/g, ':id').replace(/\{.*?\}/g, ':param') });
    }
  }
  return endpoints;
}

function getEndpointsFromRoutes() {
  const endpoints = [];
  const files = fs.readdirSync(routesPath).filter(f => f.endsWith('.routes.ts'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(routesPath, file), 'utf-8');
    
    // Base path assumption from filename (e.g., auth.routes.ts -> /auth)
    // Wait, let's read index.ts to get the base path mapping
    
    const indexContent = fs.readFileSync(path.join(routesPath, 'index.ts'), 'utf-8');
    const indexRegex = /router\.use\('(\/[^']*)',\s*([a-zA-Z]+)Routes/g;
    let indexMatch;
    const basePaths = {};
    while ((indexMatch = indexRegex.exec(indexContent)) !== null) {
      const basePath = indexMatch[1]; // e.g. /auth
      const routeName = indexMatch[2].toLowerCase(); // e.g. auth
      basePaths[routeName] = basePath;
    }
    
    const routePrefixName = file.replace('.routes.ts', '');
    let basePath = basePaths[routePrefixName] !== undefined ? basePaths[routePrefixName] : `/${routePrefixName}`;
    if (basePath === '/') basePath = '';
    
    const regex = /router\.(get|post|put|patch|delete)\('(\/[^']*)'/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      let routePath = match[2];
      if (routePath === '/') routePath = '';
      endpoints.push({ file, method: match[1].toUpperCase(), path: `${basePath}${routePath}`.replace('//', '/') });
    }
  }
  return endpoints;
}

const docsEndpoints = getEndpointsFromDocs();
const routesEndpoints = getEndpointsFromRoutes();

// Deduplicate
const uniqueDocs = [...new Set(docsEndpoints.map(e => `${e.method} ${e.path}`))].sort();
const uniqueRoutes = [...new Set(routesEndpoints.map(e => `${e.method} ${e.path}`))].sort();

console.log('--- Missing Endpoints in Routes ---');
for (const ep of uniqueDocs) {
  if (!uniqueRoutes.includes(ep)) {
    console.log(`Missing: ${ep}`);
  }
}

console.log('\n--- Extra Endpoints in Routes (Not in Docs) ---');
for (const ep of uniqueRoutes) {
  if (!uniqueDocs.includes(ep)) {
    console.log(`Extra: ${ep}`);
  }
}
