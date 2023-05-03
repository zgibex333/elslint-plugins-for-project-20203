module.exports = (path) =>
  path === "." || path.startsWith("./") || path.startsWith("../");
