import express from 'express';
import listEndpoints from 'express-list-endpoints';
import routes from '../src/routes/index';

const app = express();
app.use('/api/v1', routes);

const endpoints = listEndpoints(app);
endpoints.forEach(e => {
  console.log(`${e.methods.join(',')} ${e.path}`);
});
