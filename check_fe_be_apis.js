const fs = require('fs');
const path = require('path');
const expressListEndpoints = require('express-list-endpoints');
const express = require('express');

const rootDir = __dirname;
const backendRoutesPath = path.join(rootDir, 'src', 'routes', 'index');
const frontendServicesDir = path.join(rootDir, '..', 'web-frontend', 'src', 'services');

// 1. Get backend implemented APIs
let implementedApis = new Set();
try {
    const router = require(backendRoutesPath).default;
    const app = express();
    app.use('/api/v1', router);
    const endpoints = expressListEndpoints(app);

    endpoints.forEach(e => {
        e.methods.forEach(m => {
            let pathStr = e.path;
            
            // Clean RegExp from express-list-endpoints
            let regMatch = pathStr.match(/RegExp\(\/\^\(\\\/\)\\\/([a-zA-Z0-9\-]+)\\\/\?\(\?\=\\\/\|\$\)\/i\)/);
            if (regMatch) {
                let base = pathStr.split(' RegExp')[0].trim();
                if (base.endsWith('/')) base = base.slice(0, -1);
                let after = pathStr.split(')')[pathStr.split(')').length - 1].trim();
                if (after === 'i)' || after === ')') after = '';
                else if (after.startsWith(') ')) after = after.substring(2);
                else if (after.startsWith('i) ')) after = after.substring(3);
                else if (after.startsWith('/')) after = after;
                else if (after.startsWith(' /')) after = after.substring(1);
                
                if (after && !after.startsWith('/')) after = '/' + after;
                pathStr = `${base}/${regMatch[1]}${after}`;
            }
            
            pathStr = pathStr.replace(/ /g, '');
            pathStr = pathStr.replace(/\/+/g, '/');
            // Normalize params
            pathStr = pathStr.replace(/\/:([a-zA-Z0-9_]+)/g, '/:param');
            
            implementedApis.add(`${m} ${pathStr}`);
        });
    });
} catch (e) {
    console.error("Error loading backend routes:", e);
    process.exit(1);
}

// 2. Get frontend used APIs
let frontendApis = new Set();
const apiRegex = /(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/v1[a-zA-Z0-9\/\-{}]+)/g;

function scanFrontendServices(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanFrontendServices(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let match;
            while ((match = apiRegex.exec(content)) !== null) {
                let method = match[1];
                let pathStr = match[2];
                // normalize {id} or :id to :param
                pathStr = pathStr.replace(/{[a-zA-Z0-9_]+}/g, '/:param');
                pathStr = pathStr.replace(/:[a-zA-Z0-9_]+/g, '/:param');
                // fix some duplicate slash
                pathStr = pathStr.replace(/\/+/g, '/');
                frontendApis.add(`${method} ${pathStr}`);
            }
        }
    }
}

scanFrontendServices(frontendServicesDir);

// 3. Compare
const missingInBackend = [];
for (const api of frontendApis) {
    if (!implementedApis.has(api)) {
        missingInBackend.push(api);
    }
}

const extraInBackend = [];
for (const api of implementedApis) {
    if (!frontendApis.has(api)) {
        extraInBackend.push(api);
    }
}

console.log('=== APIs USED IN FRONTEND BUT NOT IMPLEMENTED IN BACKEND ===');
if (missingInBackend.length === 0) {
    console.log("None! All frontend APIs exist in the backend.");
} else {
    console.log(missingInBackend.sort().join('\n'));
}

console.log('\n=== APIs IMPLEMENTED IN BACKEND BUT NOT USED IN FRONTEND ===');
if (extraInBackend.length === 0) {
    console.log("None! Frontend uses all backend APIs.");
} else {
    console.log(extraInBackend.sort().join('\n'));
}
