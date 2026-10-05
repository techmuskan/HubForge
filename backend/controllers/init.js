const fs = require("fs").promises;
const path = require("path");
const { CONFIG_FILE, hubPath } = require("./repoConfig");

async function initRepo(repository) {
    const repoPath = hubPath();
    const commitsPath = path.join(repoPath, "commits");

    try{
        if (!repository || !/^[A-Za-z0-9._-]+$/.test(repository)) {
            throw new Error("Use a repository name containing only letters, numbers, dots, hyphens, or underscores.");
        }
        await fs.mkdir(repoPath, {recursive:true});
        await fs.mkdir(commitsPath, {recursive:true});
        await fs.writeFile(
            path.join(repoPath, CONFIG_FILE),
            JSON.stringify({ repository, bucket: process.env.S3_BUCKET }, null, 2)
        );
        console.log(`Repository '${repository}' initialized and linked locally.`);
    }catch(err){
        console.log("Error in initializing in repository.",err);
    }
}

module.exports = {initRepo};
