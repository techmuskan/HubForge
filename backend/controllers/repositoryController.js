const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");
const { s3, S3_BUCKET } = require("../config/aws-config");
const { GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { storageErrorMessage } = require("./storageError");

async function createRepository  (req, res)  {
    const {name, content, visibility, description} = req.body;

    try{
        if(!name){
            return res.status(400).json({error: "Repository name is required!"});
        }
        const newRepository = new Repository({
            name: name.trim(), owner: req.userId, visibility: Boolean(visibility), content: content || [], description,
        })

        const result = await newRepository.save();

        res.status(201).json({message: "Created!", repositoryId : result._id});
    }catch(err){
        console.error("Error during repository creation: ", err);
        if (err.code === 11000) return res.status(409).json({ error: "A repository with this name already exists." });
        res.status(500).send("Server error"); 
    }
}
async function getAllRepositories  (req, res)  {
    try{
        const repos = await Repository.find({ visibility: false, owner: { $ne: req.userId } }).populate("owner", "username").populate("issues");
        res.json(repos);
    }catch(err){
        console.error("Unable to fetch repositories: ", err);
        res.status(500).send("Server error!");
    }
}
async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {

    const repository = await Repository.findById(id)
    .populate("owner", "username")
    .populate("issues");


    if (!repository) {
      return res.status(404).json({ message: "Repository not found!" });
    }
    if (repository.visibility && String(repository.owner._id) !== req.userId) return res.status(403).json({ message: "This repository is private." });

    res.json(repository);
  } catch (err) {
    console.error("Error in fetching repo with repoId: ", err.message);
    res.status(500).send("Server Error!");
  }
}
async function listRepositoryFiles(req, res) {
  try {
    const repository = await Repository.findById(req.params.id);
    if (!repository) return res.status(404).json({ message: "Repository not found!" });
    if (repository.visibility && String(repository.owner) !== req.userId) return res.status(403).json({ message: "This repository is private." });
    const prefix = `repositories/${repository.name}/commits/`;
    const data = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }));
    const versions = (data.Contents || [])
      .filter((item) => !item.Key.endsWith("commit.json"))
      .map((item) => {
        const [commitId, ...pathParts] = item.Key.slice(prefix.length).split("/");
        return { path: pathParts.join("/"), commitId, size: item.Size, updatedAt: item.LastModified };
      });
    const latestByPath = new Map();
    for (const version of versions) {
      const current = latestByPath.get(version.path);
      if (!current) {
        latestByPath.set(version.path, { ...version, versionCount: 1 });
      } else if (new Date(version.updatedAt) > new Date(current.updatedAt)) {
        latestByPath.set(version.path, { ...version, versionCount: current.versionCount + 1 });
      } else {
        current.versionCount += 1;
      }
    }
    res.json([...latestByPath.values()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  } catch (err) {
    console.error("Unable to list repository files:", err.message);
    res.status(503).json({ message: storageErrorMessage(err) });
  }
}
async function downloadRepositoryFile(req, res) {
  try {
    const { path: filePath, commit } = req.query;
    if (!filePath || !commit || filePath.includes("..") || filePath.startsWith("/")) {
      return res.status(400).json({ message: "A valid file path and commit are required." });
    }
    const repository = await Repository.findById(req.params.id);
    if (!repository) return res.status(404).json({ message: "Repository not found!" });
    if (repository.visibility && String(repository.owner) !== req.userId) return res.status(403).json({ message: "This repository is private." });
    const key = `repositories/${repository.name}/commits/${commit}/${filePath}`;
    const object = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    res.setHeader("Content-Type", object.ContentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filePath.split("/").pop().replace(/[^a-zA-Z0-9._-]/g, "_")}"`);
    object.Body.pipe(res);
  } catch (err) {
    if (err.name === "NoSuchKey") return res.status(404).json({ message: "This file version was not found." });
    console.error("Unable to download repository file:", err.message);
    res.status(503).json({ message: storageErrorMessage(err) });
  }
}
async function fetchRepositoryByName  (req, res)  {
    const { name } = req.params;
    try{
        const repository = await Repository.find({name}).populate("owner").populate("issues");
        if (!repository || repository.length === 0) {
            return res.status(404).json({ message: "Repository not found!" });
        }
        res.json(repository);
    }catch(err){
        console.error("Error in fetching repo with repoName: ", err);
        res.status(500).send("Server Error!");
    }
}
async function fetchRepositoriesForCurrentUser  (req, res)  {
    const  userId  = req.params.userId;
    try{
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (userId !== req.userId) return res.status(403).json({ message: "You can only view your own repositories." });
        const repository = await Repository.find({owner: userId}).populate("issues");
        res.json(repository);
    }catch(err){
        console.error("Error in fetching repositories with userId: ", err);
        res.status(500).send("Server Error!");
    }
}
async function updateRepository  (req, res)  {
    const {id} = req.params;
    const { content, description } = req.body;

    try{
        const repo = await Repository.findById(id);
        if (!repo) {
            return res.status(404).json({ message: "Repository not found!" });
        }
        if (String(repo.owner) !== req.userId) return res.status(403).json({ message: "Only the owner can update this repository." });
        if (content !== undefined) repo.content.push(content);
        if (description !== undefined) repo.description = description;

        const updatedRepo = await repo
        .save();
        res.json({message: "Repo updated successfully!", repository: updatedRepo})
    }catch(err){
        console.error("Error in updating the repo: ", err);
        res.status(500).send("Server Error!");
    }
}
async function toggleVisibilityById  (req, res)  {
    const {id} = req.params;
    const {visibility} = req.body;
    try{
        const repo = await Repository.findById(id);
        if (!repo) {
            return res.status(404).json({ message: "Repository not found!" });
        }
        if (String(repo.owner) !== req.userId) return res.status(403).json({ message: "Only the owner can change visibility." });
        repo.visibility = !repo.visibility;
        const change = await repo.save()
        res.json({message:"toggleVisibility changed!", repository: change});
    }catch(err){
        console.error("Error in toggleVisibilityById: ", err);
        res.status(500).send("Server Error!");
    }
}
async function deleteRepository  (req, res)  {
    const {id} = req.params;
    try{
        const repo = await Repository.findById(id);
        if(!repo){
            return res.status(404).json({ message: "Repository not found!" });
        }
        if (String(repo.owner) !== req.userId) return res.status(403).json({ message: "Only the owner can delete this repository." });
        await repo.deleteOne();
        await Issue.deleteMany({ repository: id });
        res.json({message:"Repo deleted succesfully!", repository: repo});
    }catch(err){
        console.error("Error in deleting the repo: ", err);
        res.status(500).send("Server Error!");
    }
}

module.exports = {
    createRepository, getAllRepositories, fetchRepositoryById, listRepositoryFiles, downloadRepositoryFile, fetchRepositoryByName, fetchRepositoriesForCurrentUser, updateRepository, toggleVisibilityById, deleteRepository
};
