// import express, bodyParser
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const graphqlock = require('graphqlock');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .sendFile(path.resolve(__dirname, './frontend/public/index.html'));
// });

app.post(
  '/auth',
  // isAuth,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

app.use(
  '/graphql',
  isAuth,
  // graphqlock.loginLink,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  }),
  (req, res) => {
    return res.status(200);
  }
);

// app.post('/graphql', isAuth, (req, res) => {
//   res.status(200).json(res.locals.role);
// });
