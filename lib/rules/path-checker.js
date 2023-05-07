/**
 * @fileoverview fsd relative path checker
 * @author zgibex
 */
"use strict";

const path = require("path");
const isPathRelative = require("../helpers/isPathRelative");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    messages: {
      message:
        "Imports should be relative in terms of same slice. Change it, Son!",
    },
    docs: {
      description: "fsd relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code', // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias || "";
    return {
      ImportDeclaration(node) {
        // "example: app/entities/Article"
        const value = node.source.value;

        const importTo = alias ? value.replace(`${alias}/`, "") : value;

        // "example: C:\work\ulbi\eslint-custom-plugins\plugin1>"
        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({
            node,
            messageId: "message",
            fix: (fixer) => {
              const filePath = getNormalizedCurrentFilePath(fromFilename);
              const normalizedPath = filePath.split("/").slice(0, -1).join("/");
              let relativePath = path
                .relative(normalizedPath, `/${importTo}`)
                .split("\\")
                .join("/");
              if (!relativePath.startsWith(".")) {
                relativePath = "./" + relativePath;
              }
              return fixer.replaceText(node.source, `'${relativePath}'`);
            },
          });
        }
      },
    };
  },
};

const layers = {
  entities: "entities",
  features: "features",
  shared: "shared",
  widgets: "widgets",
  pages: "pages",
};

function getNormalizedCurrentFilePath(sourcePath) {
  const normalizedPath = path.toNamespacedPath(sourcePath);
  const projectFrom = normalizedPath.split("src")[1];
  return projectFrom.split("\\").join("/");
}

function shouldBeRelative(from, to) {
  // "example: app/entities/Article"
  // "example: C:\work\ulbi\src\entities\Article>"
  if (isPathRelative(to)) {
    return false;
  }
  const toArray = to.split("/");
  const toLayer = toArray[0];
  const toSlice = toArray[1];

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const projectFrom = getNormalizedCurrentFilePath(from);
  const fromArray = projectFrom.split("/");
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}
