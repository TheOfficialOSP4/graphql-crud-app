const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
        role: args.userInput.role
      });

      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  // init login resolver that attempts to find a user and if it does not find one, throw error that user does not exist
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    //  check if password is a valid password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    // if login information is valid, create jwt with userID, email, and graphql role
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );
    // return object with token (new jwt), userID, token expiration, and role
    return { token: token, userId: user.id, tokenExpiration: 1, role: user.role };
  }
};
