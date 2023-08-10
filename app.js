// import express, cookieParser, cors, bodyParser, graphqlHttp, shieldql, and mongoose
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const shieldql = require('shieldql');
const mongoose = require('mongoose');

// import and initialize .env functionality
const dotenv = require('dotenv');

// import graphQL schema and resolvers
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

// import isAuth controller that handles all user authentication
const isAuth = require('./middleware/is-auth');

dotenv.config();
shieldql.shieldqlConfig();
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
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.post(
  '/auth',
  // isAuth,
  // (req, res, next) => {
  //   console.log("app.js line 51: full query: ", req.body);
  //   return next();
  // },
  shieldql.sanitizeQuery,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

// graphql endpoint handler, handles all requests made to our graphQL interface that connects to our database
app.post(
  '/graphql',
  shieldql.sanitizeQuery,
  // (req, res, next) => {
  //   console.log("app.js line 66: full query: ", req.body);
  //   return next();
  // },
  isAuth,  // isAuth populates res.locals.role with the user's role
  shieldql.loginLink,
  shieldql.validateUser,
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
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});
