const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'documents', 'docs', 'api');
const routesDir = path.join(__dirname, 'src', 'routes');

const docApis = new Set();
const routeApis = new Set();

// 1. Extract APIs from docs
function extractFromDocs(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const regex = /### `(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/v1[a-zA-Z0-9\/\-:]+)`/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                docApis.add(`${match[1]} ${match[2]}`);
            }
        }
    }
}

extractFromDocs(docsDir);

console.log('--- Documented APIs ---');
console.log(Array.from(docApis).sort().join('\n'));
