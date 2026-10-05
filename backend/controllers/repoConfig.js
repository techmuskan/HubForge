const fs = require("fs").promises;
const path = require("path");

const CONFIG_FILE = "config.json";

function hubPath() {
  return path.resolve(process.cwd(), ".hub");
}

async function readRepoConfig() {
  try {
    const raw = await fs.readFile(path.join(hubPath(), CONFIG_FILE), "utf8");
    const config = JSON.parse(raw);
    if (!config.repository) throw new Error("No repository selected");
    return config;
  } catch {
    throw new Error("Repository is not linked. Run: node backend/index.js init <repository-name>");
  }
}

module.exports = { CONFIG_FILE, hubPath, readRepoConfig };
