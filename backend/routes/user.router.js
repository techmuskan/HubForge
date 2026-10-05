const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.get("/allUsers", requireAuth, userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id" , requireAuth, userController.getUserProfile);
userRouter.put("/updateProfile/:id", requireAuth, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", requireAuth, userController.deleteUserProfile);

module.exports = userRouter;
