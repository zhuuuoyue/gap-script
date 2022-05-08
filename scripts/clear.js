"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function isDirectory(dir) {
    if (!fs_1.default.existsSync(dir)) {
        return false;
    }
    return fs_1.default.statSync(dir).isDirectory();
}
function removeDirectory(dir) {
    if (isDirectory(dir)) {
        console.log("remove directory:", dir);
        fs_1.default.rmdirSync(dir, { recursive: true });
    }
}
const workspace = path_1.default.parse(__dirname).dir;
removeDirectory(path_1.default.join(workspace, "build"));
removeDirectory(path_1.default.join(workspace, "dist"));
