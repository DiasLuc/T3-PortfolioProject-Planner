const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function loadSwaggerSpec() {
  const specPath = path.resolve(__dirname, "../../docs/swagger.yaml");
  const fileContents = fs.readFileSync(specPath, "utf8");
  return yaml.load(fileContents);
}

module.exports = {
  loadSwaggerSpec
};
