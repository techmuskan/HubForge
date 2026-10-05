const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const dns = require('node:dns');
const path = require("path");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");
const { mainRouter} =  require("./routes/main.router.js");

dotenv.config({ path: path.resolve(__dirname, ".env") });
dns.setServers(['8.8.8.8', '8.8.4.4']);

yargs(hideBin(process.argv))
  .command("start", "Start the backend server", {}, startServer)
  .command(
    "init <repository>",
    "Initialize and link a local folder to a HubForge repository",
    (yargs) => yargs.positional("repository", { type: "string", describe: "HubForge repository name" }),
    (argv) => initRepo(argv.repository),
  )
  .command(
    "add <file>",
    "Add a file to repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "Files to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    },
  )
  .command(
    "commit <message>",
    "Commit a file to repository",
    (yargs) => {
      yargs.positional("message", {
        describe: "Files to commit to the repository",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    },
  )
  .command("push", "Push file/files to repository (s3)", {}, pushRepo)
  .command("pull", "Pull file/files from the repository (s3)", {}, pullRepo)
  .command(
    "revert <commitId>",
    "Revert change from the repository",
    (yargs) => {
      yargs.positional("commitId", {
        describe: "The commit ID to revert",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitId);
    },
  )
  .demandCommand(1, "You need atleast one command")
  .help().argv;


  function startServer(){
    const app = express();
    const port = process.env.PORT;

    // app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI = process.env.MONGODB_URI;

    mongoose.connect(mongoURI).then(()=>
      console.log("MongoDB is connected")
    ).catch((err) =>
      console.error("Unable to connect mongodb: ", err)
    )

    app.use(cors({ origin: "*" }));

    app.use("/", mainRouter);

    let user = "test";
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      socket.on("join-room", (userID) =>{
        user = userID;
        console.log("======");
        console.log(user);
        console.log("======");
        console.log(userID);
      });
    })

    const db = mongoose.connection;
    db.once("open", async () => {
      console.log("CRUD operations are called");
    });

    httpServer.listen(port, () => {
      console.log(`Connection chal rha h betaaaaa is port ${port} pr!!!!!!!!!!!!!!!!!!`);
    })
  }
