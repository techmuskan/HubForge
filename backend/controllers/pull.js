const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");
const { GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { readRepoConfig } = require("./repoConfig");
const { storageErrorMessage } = require("./storageError");

async function pullRepo(params) {
  const repoPath = path.resolve(process.cwd(), ".hub");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const config = await readRepoConfig();
    if (!S3_BUCKET) throw new Error("S3_BUCKET is missing in backend/.env");
    const prefix = `repositories/${config.repository}/commits/`;
    const data = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }));
    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key;
      const relativeKey = key.slice(prefix.length);
      const commitDir = path.join(commitsPath, path.dirname(relativeKey));

      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.send(new GetObjectCommand(params));
      await fs.writeFile(path.join(commitsPath, relativeKey), await fileContent.Body.transformToByteArray());
    }
    console.log(`All commits pulled from repository '${config.repository}'.`);
  } catch (err) {
    console.error("Unable to pull from S3:", err.message);
    console.error(storageErrorMessage(err));
  }
}

module.exports = { pullRepo };
