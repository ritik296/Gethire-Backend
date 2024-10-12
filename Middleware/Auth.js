const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //console.log('Request Cookies:', req.cookies);

  const token = req.cookies.token; // Ensure this matches the cookie name
  console.log('Request Cookies:',  token);
  if (!token) {
    console.log('No token found in cookies');
    // return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    console.log( "decoded part is "+decoded);
    req.user = decoded.user;
    console.log('Decoded User:', req.user);
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
