import fs from "fs";
import path from "path";

function isDirectory(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return false;
  }
  return fs.statSync(dir).isDirectory();
}

function removeDirectory(dir: string) {
  if (isDirectory(dir)) {
    console.log("remove directory:", dir);
    fs.rmdirSync(dir, { recursive: true });
  }
}

const workspace = path.parse(__dirname).dir;
removeDirectory(path.join(workspace, "build"));
removeDirectory(path.join(workspace, "dist"));
