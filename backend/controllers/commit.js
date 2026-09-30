const fs = require("fs").promises;
const path = require("path");
const { json } = require("stream/consumers");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".hub");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitId = uuidv4();
    const commitDir = path.join(commitPath, commitId);
    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file),
      );
    }
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString() }),
    );
    console.log(`Commit ${commitId} created with a message ${message}.`);
  } catch (err) {
    console.log("Unable to commit.", err);
  }
}

module.exports = { commitRepo };
