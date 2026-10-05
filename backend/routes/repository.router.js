const express = require("express");
const repositoryController = require("../controllers/repositoryController");
const { requireAuth } = require("../middleware/authMiddleware");

const repositoryRouter = express.Router();

repositoryRouter.post("/repo/create", requireAuth, repositoryController.createRepository);
repositoryRouter.get("/repo/all", requireAuth, repositoryController.getAllRepositories);
repositoryRouter.get("/repo/:id/files", requireAuth, repositoryController.listRepositoryFiles);
repositoryRouter.get("/repo/:id/file", requireAuth, repositoryController.downloadRepositoryFile);
repositoryRouter.get("/repo/:id", requireAuth, repositoryController.fetchRepositoryById);
repositoryRouter.get("/repo/name/:name", requireAuth, repositoryController.fetchRepositoryByName);
repositoryRouter.get("/repo/user/:userId", requireAuth, repositoryController.fetchRepositoriesForCurrentUser);
repositoryRouter.put("/repo/update/:id", requireAuth, repositoryController.updateRepository);
repositoryRouter.patch("/repo/toggle/:id", requireAuth, repositoryController.toggleVisibilityById);
repositoryRouter.delete("/repo/delete/:id", requireAuth, repositoryController.deleteRepository);

module.exports = repositoryRouter;
