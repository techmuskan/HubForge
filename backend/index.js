const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { initRepo } = require("./controllers/init.js");
const { addRepo } = require("./controllers/add.js");
const { commitRepo } = require("./controllers/commit.js");
const { pushRepo } = require("./controllers/push.js");
const { pullRepo } = require("./controllers/pull.js");
const { revertRepo } = require("./controllers/revert.js");

yargs(hideBin(process.argv))
  .command("init", "Initialize a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "Files to add to the staging area",
        type: "string",
      });
    },
    addRepo,
  )
  .command(
    "push <file>",
    "Push file/files to repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "Files to push to the repository",
        type: "string",
      });
    },
    pushRepo,
  )
  .command(
    "pull <file>",
    "Pull file/files from the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "Files to pull from repository",
        type: "string",
      });
    },
    pullRepo,
  )
  .command(
    "revert <file>",
    "Revert change from the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "Files to add to the staging area",
        type: "string",
      });
    },
    revertRepo,
  )
  .demandCommand(1, "You need atleast one command")
  .help().argv;
