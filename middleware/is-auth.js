const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('---entering isAuth----');
  // console.log('req cookies header', req.cookies);
  const authHeader = req.get('Authorization');
  console.log('req Authorization header', authHeader);
  if (!authHeader) {
    console.log('---entering !authHeader----');
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    console.log('---entering !token----');
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretkey');
  } catch (err) {
    console.log('---error in doing jwt.verify---');
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    console.log('---entering !decodedToken---');
    req.isAuth = false;
    return next();
  }

  console.log("---success! you've entered the last step!---");
  req.isAuth = true;
  console.log('req.isAuth if it works: ', req.isAuth);
  req.userId = decodedToken.userId;
  // for GraphQLock
  res.locals.username = decodedToken.email;
  res.locals.role = decodedToken.role;

  console.log("at the end of isAuth, res.locals: ", res.locals)
  return next();
};
