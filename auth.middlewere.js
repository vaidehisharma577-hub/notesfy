const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "coding";

const sign = (user) => jwt.sign({ userId: String(user._id), name: user.name }, SECRET, { expiresIn: "30d" });

// Requires a valid token
const auth = (req, res, next) => {
  try {
    const d = jwt.verify(req.headers.authorization, SECRET);
    if (!d.userId) throw new Error("old token");
    req.userId = d.userId;
    req.userName = d.name;
    next();
  } catch {
    res.status(401).send({ msg: "Login First" });
  }
};

// Token is optional (used for reading a single note: public = anyone, private = owner)
const optionalAuth = (req, res, next) => {
  try {
    const d = jwt.verify(req.headers.authorization, SECRET);
    req.userId = d.userId;
  } catch {}
  next();
};

module.exports = { auth, optionalAuth, sign };
