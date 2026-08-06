const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'documents', 'docs', 'api');
const routesDir = path.join(__dirname, 'src', 'routes');

const docApis = new Set();
const implementedApis = new Set();

// 1. Extract APIs from docs
function extractFromDocs(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const regex = /###\s+(?:\d+\.\s+)?(?:`)?(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/v1[a-zA-Z0-9\/\-:]+)(?:`)?/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                // normalize paths
                let p = match[2];
                // if it has something like :orderId, keep it.
                docApis.add(`${match[1]} ${p}`);
            }
        }
    }
}
extractFromDocs(docsDir);

// 2. Extract APIs from express (mocked via previous output)
const expressListEndpoints = require('express-list-endpoints');
const express = require('express');
const router = require('./src/routes/index').default;

const app = express();
app.use('/api/v1', router);
const endpoints = expressListEndpoints(app);

endpoints.forEach(e => {
    e.methods.forEach(m => {
        // Fix weird RegExp paths from nested routers
        let pathStr = e.path;
        
        // Convert /:orderId to just strings to be safe later if needed, but not necessary yet.
        // Clean RegExp:
        // express-list-endpoints outputs: /api/v1/orders/:orderId/ RegExp(/^(?:\/)\/tasks\/?(?=\/|$)/i) /:id
        let regMatch = pathStr.match(/RegExp\(\/\^\(\\\/\)\\\/([a-zA-Z0-9\-]+)\\\/\?\(\?\=\\\/\|\$\)\/i\)/);
        if (regMatch) {
            let base = pathStr.split(' RegExp')[0].trim();
            if (base.endsWith('/')) base = base.slice(0, -1);
            let after = pathStr.split(')')[pathStr.split(')').length - 1].trim();
            if (after === 'i)' || after === ')') after = ''; // fallback
            else if (after.startsWith(') ')) after = after.substring(2);
            else if (after.startsWith('i) ')) after = after.substring(3);
            else if (after.startsWith('/')) after = after;
            else if (after.startsWith(' /')) after = after.substring(1);
            
            // Clean up any loose ends
            if (after && !after.startsWith('/')) after = '/' + after;
            
            pathStr = `${base}/${regMatch[1]}${after}`;
        }
        
        // Remove :orderId(/:id) if it got messed up, just generic cleanup
        pathStr = pathStr.replace(/ /g, '');
        pathStr = pathStr.replace(/\/+/g, '/');

        // Normalise parameters so we can compare (e.g. :orderId -> :id)
        pathStr = pathStr.replace(/\/:([a-zA-Z0-9]+)/g, '/:id');
        
        implementedApis.add(`${m} ${pathStr}`);
    });
});

const missing = [];
for (const api of docApis) {
    if (!implementedApis.has(api)) {
        // Handle path parameter variations (e.g. :orderId vs :id)
        const parts = api.split(' ');
        const method = parts[0];
        const path = parts[1].replace(/:[a-zA-Z0-9]+/g, ':param');
        
        let foundMatch = false;
        for (const implApi of implementedApis) {
            const implParts = implApi.split(' ');
            const implMethod = implParts[0];
            const implPath = implParts[1].replace(/:[a-zA-Z0-9]+/g, ':param');
            if (method === implMethod && path === implPath) {
                foundMatch = true;
                break;
            }
        }
        if (!foundMatch) {
            missing.push(api);
        }
    }
}

const extra = [];
for (const api of implementedApis) {
    const parts = api.split(' ');
    const method = parts[0];
    const pathStr = parts[1].replace(/:[a-zA-Z0-9]+/g, ':param');
    
    let foundMatch = false;
    for (const docApi of docApis) {
        const docParts = docApi.split(' ');
        const docMethod = docParts[0];
        const docPath = docParts[1].replace(/:[a-zA-Z0-9]+/g, ':param');
        if (method === docMethod && pathStr === docPath) {
            foundMatch = true;
            break;
        }
    }
    if (!foundMatch) {
        extra.push(api);
    }
}

console.log('--- MISSING APIs (in docs but not in code) ---');
console.log(missing.sort().join('\n'));
console.log('\n--- EXTRA APIs (in code but not in docs) ---');
console.log(extra.sort().join('\n'));
