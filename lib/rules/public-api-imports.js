/**
 * @fileoverview Plugin for FSD public api path checking
 * @author zgibex
 */
"use strict";

const isPathRelative = require("../helpers/isPathRelative");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    messages: {
      message:
        "Absolute imports are allowed only from public API (except shared layer)",
    },
    docs: {
      description: "Plugin for FSD public api path checking",
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
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias || "";
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

        if (!checkingLayers[layer]) return;

        const isImportNotFromPublicApi = segments.length > 2;

        if (isImportNotFromPublicApi) {
          context.report({
            node,
            messageId: "message",
          });
        }
      },
    };
  },
};
