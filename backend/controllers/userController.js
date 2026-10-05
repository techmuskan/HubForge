const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

let client;

async function connectClient(params) {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error during fetching: ", err);
    res.status(500).send("Server Error!");
  }
}

async function signup(req, res) {
  const { username, email, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);
    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1hr" },
    );
    res.status(201).json({ token, userId: result.insertedId.toString() });
  } catch (err) {
    console.error("Error during signup: ", err);
    res.status(500).send("Server Error!");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login: ", err.message);
    res.status(500).send("Server Error!");
  }
}

async function getUserProfile(req, res) {
  const currentId = req.params.id;
  if (currentId !== req.userId) return res.status(403).json({ message: "You can only access your own profile." });
  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(currentId) }, { projection: { password: 0 } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    return res.json({ message: "Profile is fetched!", user });
  } catch (err) {
    console.error("Error during getting user profile: ", err);
    res.status(500).send("Server Error!");
  }
}

async function updateUserProfile(req, res) {
  const currentId = req.params.id;
  if (currentId !== req.userId) return res.status(403).json({ message: "You can only update your own profile." });
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const updateFields = {};

    if (email) {
      updateFields.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(currentId) },
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Error during updating the user: ", err.message);
    res.status(500).send("Server Error!");
  }
}

async function deleteUserProfile(req, res) {
  const currentId = req.params.id;
  if (currentId !== req.userId) return res.status(403).json({ message: "You can only delete your own profile." });

  try {
    await connectClient();
    const db = client.db("hubforge");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "Profile deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting the user: ", err.message);
    res.status(500).send("Server Error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
