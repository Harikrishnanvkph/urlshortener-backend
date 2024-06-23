const express = require("express");
const {
  getUser,
  addUser,
  loginUser,
  passwordReset,
  validateAndResetPassword,
  setPassword,
  checkResetKey,
  checkWebKey,
  incShortUrlCount,
  getUrls,
} = require("../DB/userQuery");
const exp = express.Router();

exp.get("/", (req, res, next) => {
  res.send("Very Good Morning to one and all present here");
});

exp.get("/:name", async (req, res, next) => {
  const { name } = req.params;
  const getMe = await getUser(name);
  res.send(getMe);
});

exp.post("/createUser", express.json(), async (req, res, next) => {
  const reg = req.body;
  const addMe = await addUser(reg);
  addMe ? res.send("200") : res.send("404");
});

exp.post("/login", express.json(), async (req, res, next) => {
  const reg = req.body;
  const loginMe = await loginUser(reg);
  res.send(loginMe);
});

exp.post("/password_reset", async (req, res, next) => {
  const reg = req.body;
  const pwdrst = await passwordReset(reg);
  pwdrst ? res.send("200") : res.send("404");
});

exp.post("/set/password", async (req, res, next) => {
  const reg = req.body;
  const pwdrst = await setPassword(reg.mail, reg.password);
  pwdrst ? res.send("200") : res.send("404");
});

exp.post("/checkKey", async (req, res, next) => {
  const reg = req.body;
  const pwdrst = await checkResetKey(reg.mail, reg.secretKey);
  pwdrst ? res.send("200") : res.send("404");
});

exp.post("/checkKeyValidate", async (req, res, next) => {
  const reg = req.body;
  if (await checkWebKey(reg.mail, reg.webKey)) {
    const pwdrst = await checkResetKey(reg.mail, reg.secretKey);
    pwdrst ? res.send("200") : res.send("404");
    return;
  }
  res.send("412");
});

exp.post("/shortUrlClick", async (req, res, next) => {
  const reg = req.body;
  await incShortUrlCount(reg);
  res.send("Operation Done");
});

exp.post("/getUrls", async (req, res, next) => {
    const reg = req.body;
    const deep = await getUrls(reg.mail);
    res.send(deep);
  });

module.exports = exp;
