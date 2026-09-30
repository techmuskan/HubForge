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
    (argv)=>{
      commitRepo(argv.message);
    },
  )
  .command(
    "push",
    "Push file/files to repository (s3)",
     {},
    pushRepo,
  )
  .command(
    "pull",
    "Pull file/files from the repository (s3)",
    {},
    pullRepo,
  )
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
      revertRepo(argv.commitId)
    },
  )
  .demandCommand(1, "You need atleast one command")
  .help().argv;
