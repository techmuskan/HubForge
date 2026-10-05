const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { readRepoConfig } = require("./repoConfig");
const { storageErrorMessage } = require("./storageError");

async function pushRepo(params) {
    const repoPath = path.resolve(process.cwd(), ".hub");
    const commitsPath = path.join(repoPath, "commits");;

    try{
        const config = await readRepoConfig();
        if (!S3_BUCKET) throw new Error("S3_BUCKET is missing in backend/.env");
        const commitDirs = await fs.readdir(commitsPath);
        for(const commitDir of commitDirs){
            const commitPath = path.join(commitsPath, commitDir);
            const files = await fs.readdir(commitPath);

            for(const file of files){
                const filePath = path.join(commitPath, file);
                const fileContent = await fs.readFile(filePath);
                const params = {
                    Bucket : S3_BUCKET,
                    Key:  `repositories/${config.repository}/commits/${commitDir}/${file}`,
                    Body: fileContent,
                };

                await s3.send(new PutObjectCommand(params));
            }
        }

        console.log(`All commits pushed to repository '${config.repository}'.`);
    }catch(err){
        console.error("Files are not pushed to S3:", err.message);
        console.error(storageErrorMessage(err));
    }

}

module.exports = {pushRepo};
