import express from 'express';
import next from 'next';
import routes from './routes';

require('dotenv').config();

const port = parseInt(process.env.PORT || '8081', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app, ({
  req, res, route, query
}) => {
  if (route.name === 'artist') {
    route.page = '/artist/profile';
  }
  app.render(req, res, route.page, query);
});

app
  .prepare()
  .then(() => {
    const expressApp = express();

    expressApp.use((req, res, nextFunc) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      nextFunc();
    });

    expressApp.use('/static', express.static('../static'));
    expressApp.use(handler).listen(port, { cors: { origin: '*' } });
  })
  .catch((e) => {
    process.exit();
  });
