const express = require("express");
const userRouter = require("../routes/user.router");
const repositoryRouter = require("../routes/repository.router");
const issueRouter = require("../routes/issue.router");

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repositoryRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", async(req, res) => {
    res.send("WELCOME!");
});

module.exports = { mainRouter };