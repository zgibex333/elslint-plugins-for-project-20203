/**
 * @fileoverview Plugin for FSD public api path checking
 * @author zgibex
 */
"use strict";

const isPathRelative = require("../helpers/isPathRelative");
const micromatch = require("micromatch");
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const PUBLIC_ERROR = "PUBLIC_ERROR";
const TESTING_PUBLIC_ERROR = "TESTING_PUBLIC_ERROR";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    messages: {
      [PUBLIC_ERROR]:
        "Absolute imports are allowed only from public API (except shared layer)",
      [TESTING_PUBLIC_ERROR]:
        "Test data should be imported from publicApi/testing",
    },
    docs: {
      description: "Plugin for FSD public api path checking",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code", // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
          testFilePatterns: {
            type: "array",
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const { alias, testFilePatterns = [] } = context.options[0] ?? {};
    const checkingLayers = {
      entities: "entities",
      features: "features",
      widgets: "widgets",
      pages: "pages",
    };
    return {
      ImportDeclaration(node) {
        // "example: app/entities/Article"
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, "") : value;

        if (isPathRelative(importTo)) return;

        const segments = importTo.split("/");

        const layer = segments[0];
        const slice = segments[1];

        if (!checkingLayers[layer]) return;

        const isImportNotFromPublicApi = segments.length > 2;

        const isTestingPublicApi =
          segments[2] === "testing" && segments.length < 4;

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(
                node.source,
                `'${alias}/${layer}/${slice}'`
              );
            },
          });
        }

        if (isTestingPublicApi) {
          const currentFilePath = context.getFilename();

          const isCurrentFileTesting = testFilePatterns.some((pattern) =>
            micromatch.isMatch(currentFilePath, pattern)
          );

          if (!isCurrentFileTesting) {
            context.report({
              node,
              messageId: TESTING_PUBLIC_ERROR,
            });
          }
        }
      },
    };
  },
};
