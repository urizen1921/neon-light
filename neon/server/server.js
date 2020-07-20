const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();


//Config.env to ./config/config.env
require('dotenv').config({
  path:'./config/config.env'
});

//Connect to Database
connectDB();

//Use bodyParser
app.use(bodyParser.json());


//Config for development only
if(process.env.NODE_ENV === 'development') {

  app.use(cors({
    origin: process.env.CLIENT_URL
  }));

  app.use(morgan('dev'));
  //Morgan gives information about each request
  //Cors allow to deal with react for localhost at port 3000 without any problem
}

//Load all routes

const authRouter = require('./routes/auth-route.js');


//Use Routes
app.use('/api/', authRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Page not found"
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});