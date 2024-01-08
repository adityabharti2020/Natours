const User = require('../Model/userModel');

exports.signUp = async (req, res) => {
  const { name, email, password, photo, passwordConfirm } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    photo,
    passwordConfirm,
  });
  res.status(201).json({
    status: 'SignUp successfully',
    data: {
      user,
    },
  });
};
