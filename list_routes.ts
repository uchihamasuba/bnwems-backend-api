import express from 'express';
import listEndpoints from 'express-list-endpoints';
import router from './src/routes/index';

const app = express();
app.use('/api/v1', router);

const endpoints = listEndpoints(app);
const implementedApis = new Set();
endpoints.forEach(e => {
    e.methods.forEach(m => {
        implementedApis.add(`${m} ${e.path.replace(/\/:([^\/]+)/g, '/:$1')}`);
    });
});

console.log('--- Implemented APIs ---');
console.log(Array.from(implementedApis).sort().join('\n'));
