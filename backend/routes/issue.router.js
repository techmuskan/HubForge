const express = require("express");
const issueController = require("../controllers/issueController");
const { requireAuth } = require("../middleware/authMiddleware");

const issueRouter = express.Router();

issueRouter.post("/issue/create" , requireAuth, issueController.createIssue);
issueRouter.get("/issue/all/:id", requireAuth, issueController.getAllIssues);
issueRouter.get("/issue/:id", requireAuth, issueController.getIssueById);
issueRouter.put("/issue/update/:id", requireAuth, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", requireAuth, issueController.deleteIssueById);

module.exports = issueRouter;
