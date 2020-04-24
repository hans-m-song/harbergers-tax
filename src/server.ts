import express from 'express';
import bodyParser from 'body-parser';
import * as path from 'path';
import {Analysis} from './analysis';

const data = require('../log.json');
const analysis = new Analysis(data[0][0].participants);
const result = analysis.result();

const app = express();
const port = process.env.PORT || 4242;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'frontend')));

app.all('*', (req, res, next) => {
  console.log(req.method, req.url);
  next();
})

app.get('/update', (req, res) => {
  // send updates to page
  res.send(result);
});

app.post('/new', (req, res) => {
  // page requests to spawn new job
  res.send('new received')
});

app.listen(port, () => console.log(`Listening on port ${port}`));