/**
 * @fileoverview desc
 * @author zgibex
 */
"use strict";
const path = require("path");
const isPathRelative = require("../helpers/isPathRelative");
const micromatch = require("micromatch");
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    messages: {
      message: "Layer can export only from lower layers",
    },
    docs: {
      description: "desc",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
          ignoreImportPatterns: {
            type: "array",
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    const layers = {
      app: ["pages", "widgets", "features", "shared", "entities"],
      pages: ["widgets", "features", "shared", "entities"],
      widgets: ["features", "shared", "entities"],
      features: ["shared", "entities"],
      entities: ["shared", "entities"],
      shared: ["shared"],
    };

    const availableLayers = {
      app: "app",
      entities: "entities",
      features: "features",
      widgets: "widgets",
      pages: "pages",
      shared: "shared",
    };

    const { alias = "", ignoreImportPatterns = [] } = context.options[0] ?? {};

    const getCurrentFileLayer = () => {
      const currentFilePath = context.getFilename();

      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split("src")[1];
      const segments = projectPath?.split("\\");
      return segments?.[1];
    };

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, "") : value;
      const segments = importPath?.split("/");
      return segments?.[0];
    };

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const currentFileLayer = getCurrentFileLayer();
        const importLayer = getImportLayer(importPath);

        if (isPathRelative(importLayer)) {
          return;
        }

        if (
          !availableLayers[importLayer] ||
          !availableLayers[currentFileLayer]
        ) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some((pattern) => {
          return micromatch.isMatch(importPath, pattern);
        });

        if (isIgnored) {
          return;
        }

        if (!layers[currentFileLayer]?.includes(importLayer)) {
          context.report({ node: node, messageId: "message" });
        }
      },
      // visitor functions for different types of nodes
    };
  },
};
