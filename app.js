const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const graphqlock = require('graphqlock');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

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

app.use(isAuth);

app.get('/', (req, res) => {
  res
    .status(200)
    .sendFile(path.resolve(__dirname, './frontend/public/index.html'));
});

app.use(
  '/graphql',
  // graphqlock.loginLink,
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

// app.post('/graphql', isAuth, (req, res) => {
//   res.status(200).json(res.locals.role);
// });

mongoose
  .connect(
    'mongodb+srv://xjqiu28:assessmentPassword@assessment.rhrimen.mongodb.net/', 
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  });
