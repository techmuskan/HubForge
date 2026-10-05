const mongoose = require("mongoose");
const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

async function canManage(repositoryId, userId) {
  const repository = await Repository.findById(repositoryId);
  return repository && String(repository.owner) === userId;
}

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { repositoryId: id } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ error: "Issue title is required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!!" });
    }
    const repo = await Repository.findById(id);
    if (!repo) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    if (String(repo.owner) !== req.userId) return res.status(403).json({ error: "Only the owner can create issues." });
    const newIssue = new Issue({
      title,
      description,
      repository: id,
    });
    const result = await newIssue.save();
    repo.issues.push(result._id);
    await repo.save();
    res.status(201).json({
      message: "Issue created successfully!",
      issueId: result._id,
      repositoryId: repo._id,
    });
  } catch (err) {
    console.error("Error in creating issue!: ", err);
    res.status(500).send("Server Error!");
  }
}

async function getAllIssues(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid repository ID format" });
    }

    const repository = await Repository.findById(id);
    if (!repository) return res.status(404).json({ message: "Repository not found" });
    if (repository.visibility && String(repository.owner) !== req.userId) return res.status(403).json({ message: "This repository is private." });
    const issues = await Issue.find({ repository: id });

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error in fetching issues with repoId: ", err.message);
    res.status(500).send("Server Error!");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue ID format" });
    }

    const issue = await Issue.findById(id).populate("repository");
    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }
    if (issue.repository.visibility && String(issue.repository.owner) !== req.userId) return res.status(403).json({ message: "This repository is private." });
    if (!(await canManage(issue.repository, req.userId))) return res.status(403).json({ message: "Only the owner can update issues." });

    res.json(issue);
  } catch (err) {
    console.error("Error fetching issue: ", err.message);
    res.status(500).send("Server Error!");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue ID format" });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }
    if (!(await canManage(issue.repository, req.userId))) return res.status(403).json({ message: "Only the owner can delete issues." });
    await Repository.findByIdAndUpdate(issue.repository, { $pull: { issues: issue._id } });

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;

    const updatedIssue = await issue.save();
    res.json({ message: "Issue updated successfully!", issue: updatedIssue });
  } catch (err) {
    console.error("Error updating issue: ", err.message);
    res.status(500).send("Server Error!");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid issue ID format" });
    }

    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }

    res.json({ message: "Issue deleted successfully!", issueId: id });
  } catch (err) {
    console.error("Error deleting issue: ", err.message);
    res.status(500).send("Server Error!");
  }
}

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};
