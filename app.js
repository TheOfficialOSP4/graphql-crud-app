// import express, bodyParser, graphqlHttp, graphqlock, and mongoose
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
// const graphqlock = require('graphqlock');
const shieldql = require('shieldql');
const mongoose = require('mongoose');

// import and initialize .env functionality
const dotenv = require('dotenv');
dotenv.config();

// import graphQL schema and resolvers
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

// import isAuth controller that handles all user authentication
const isAuth = require('./middleware/is-auth');

const app = express();

// connect to MongoDB database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });

// parsing input text to the server
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// setting headers to avoid CORS errors
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   return next();
// });

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .sendFile(path.resolve(__dirname, './frontend/public/index.html'));
// });

// auth endpoint for login and signup requests
//post req w/ query/mutation is sent to graphqlauth resolver?
app.post(
  '/auth',
  // isAuth,
  // verifyLogin
  // graphqlock.loginLink,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
  // (req,res) => console.log('after graphqLock')
);

// graphql endpoint handler, handles all requests made to our graphQL interface that connects to our database
app.post(
  '/graphql',
  isAuth, //checks for a valid session, decodes the token, sets username and role onto res.locals
  // (req, res, next) => {
  //   console.log(res.locals);
  //   console.log(res.locals.role);
  //   console.log(res.locals.username);
  //   return next();
  // },
  // graphqlock.loginLink,
  shieldql.loginLink,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

// Page not found error handler for all routes that does not exist!
app.use('*', (req, res) => {
  return res.status(404).send('Page not found');
});

// Global error handler creates a default error object with a specified log, status of 500, and error message
// app.use((err, req, res, next) => {
//   const defaultErr = {
//     log: 'Express error handler caught unknown middleware error',
//     status: 500,
//     message: { err: 'An error occurred' },
//   };
//   const errorObj = Object.assign({}, defaultErr, err);
//   console.log(errorObj.log);
//   return res.status(errorObj.status).json(errorObj.message);
// });
