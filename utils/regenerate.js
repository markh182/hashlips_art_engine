"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { startRecreating, buildSetupRecreating } = require(path.join(
  basePath,
  "/src/main.js"
));

(() => {
  buildSetupRecreating();
  startRecreating();
})();
