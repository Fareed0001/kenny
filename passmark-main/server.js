const express = require('express');
const connectDb = require('./app/database/dbConnect');
require("dotenv").config(); 
const cors = require("cors");
const Routes = require('./app/routes/route');
const bodyParser = require('body-parser');
const helmet = require("helmet");

//Server
const app = express();
const PORT = process.env.PORT || 8080;
const http = require('http');
var server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));



app.get('/', (req, res)=>res.status(201).json({response:'Hey this is my API running 🥳'}));
app.use('/api/v1', Routes);

server.listen(PORT, () => {
    connectDb();
    console.log(`Running on port ${PORT}`);
  });