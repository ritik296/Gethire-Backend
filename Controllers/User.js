const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../Model/User");

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const { name, _id: objId } = user;
    const token = jwt.sign({ name, email, objId }, process.env.JWT_SECRET_KEY, {
      expiresIn: 86400,
    });

    return res.json({ user: { name, email }, token, msg: "Login successful" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
}

async function handleUserRegistration(req, res) {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPass });
    await user.save();

    const { _id: objId } = user;
    const token = jwt.sign({ name, email, objId }, process.env.JWT_SECRET_KEY, {
      expiresIn: 86400,
    });

    return res.json({ user: { name, email }, token });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
}

module.exports = {
  handleUserLogin,
  handleUserRegistration,
};
