const express = require("express");
const bcrypt = require("bcrypt");
const { userModel } = require("../model/user.model");
const { sign } = require("../middlewere/auth.middlewere");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).send("Name, email and password are required");
    if (String(password).length < 6) return res.status(400).send("Password must be at least 6 characters");
    if (await userModel.findOne({ email: String(email).toLowerCase() })) {
      return res.status(409).send("This email is already registered");
    }
    const hash = await bcrypt.hash(password, 10);
    await userModel.create({ name, email, password: hash });
    res.send("User Registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Can't register right now");
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await userModel.findOne({ email: String(email || "").toLowerCase() });
    if (!user) return res.status(404).send("User is not registered");
    if (!(await bcrypt.compare(password || "", user.password))) return res.status(401).send("Wrong password");
    res.send({ msg: "Login Successfully", token: sign(user), name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).send("Can't login right now");
  }
});

module.exports = { userRouter };
