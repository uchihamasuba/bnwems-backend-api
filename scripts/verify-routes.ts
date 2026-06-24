import fs from 'fs';
import path from 'path';


function extractDocsRoutes() {
  const docsDir = path.join(__dirname, '../documents/docs/api');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  const routes = new Set<string>();

  for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('**Endpoint:**')) {
        let match = line.match(/\*\*Endpoint:\*\*\s+`?([A-Z]+)\s+([^`\s]+)`?/);
        if (match) {
          const method = match[1].toUpperCase();
          const endpoint = match[2];
          routes.add(`${method} ${endpoint}`);
        }
      }
    }
  }
  return Array.from(routes).sort();
}

// Function to extract routes from Express app
function extractCodeRoutes() {
    // To avoid importing app and dealing with DB connections, we parse the route files
    const routesDir = path.join(__dirname, '../src/routes');
    const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));
    const routes = new Set<string>();
    
    // We also need to know the base path for each route file.
    // They are mounted in src/app.ts:
    // app.use('/api/v1/auth', authRoutes);
    // Let's parse app.ts to get the mount points
    const appContent = fs.readFileSync(path.join(__dirname, '../src/app.ts'), 'utf8');
    const mounts = new Map<string, string>(); // routeVar -> mountPath
    const importRegex = /import (\w+) from '\.\/routes\/([^']+)'/g;
    let match;
    const imports = new Map<string, string>();
    while ((match = importRegex.exec(appContent)) !== null) {
        imports.set(match[1], match[2] + '.ts');
    }
    
    const useRegex = /app\.use\('([^']+)',\s*(\w+)\)/g;
    while ((match = useRegex.exec(appContent)) !== null) {
        const mountPath = match[1];
        const varName = match[2];
        const filename = imports.get(varName);
        if (filename) {
            mounts.set(filename, mountPath);
        }
    }

    for (const file of files) {
        if (!mounts.has(file)) continue;
        const mountPath = mounts.get(file)!;
        const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
        
        // Match router.get('/path', ...)
        const routeRegex = /router\.(get|post|put|delete|patch)\('([^']+)'/g;
        let routeMatch;
        while ((routeMatch = routeRegex.exec(content)) !== null) {
            const method = routeMatch[1].toUpperCase();
            let path = routeMatch[2];
            // Resolve path
            let fullPath = mountPath + (path === '/' ? '' : path);
            fullPath = fullPath.replace(/\/$/, ''); // Remove trailing slash
            
            // Convert express path params (:id) to {id} for comparison, as docs use {id}
            // Actually, let's keep it as is and standardise both
            fullPath = fullPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
            
            routes.add(`${method} ${fullPath}`);
        }
    }
    return Array.from(routes).sort();
}

function normalizeRoute(r: string) {
    return r.replace(/\/$/, '').replace(/\{[a-zA-Z0-9_]+\}/g, ':param').replace(/:[a-zA-Z0-9_]+/g, ':param');
}

const docsRoutes = extractDocsRoutes();
const codeRoutes = extractCodeRoutes();

const docsNormalized = new Set(docsRoutes.map(normalizeRoute));
const codeNormalized = new Set(codeRoutes.map(normalizeRoute));

console.log('--- MISSING IN CODE (Present in Docs but not in Code) ---');
for (const r of docsRoutes) {
    if (!codeNormalized.has(normalizeRoute(r))) {
        console.log(`Missing: ${r}`);
    }
}

console.log('\n--- EXTRA IN CODE (Present in Code but not in Docs) ---');
for (const r of codeRoutes) {
    if (!docsNormalized.has(normalizeRoute(r))) {
        console.log(`Extra: ${r}`);
    }
}
