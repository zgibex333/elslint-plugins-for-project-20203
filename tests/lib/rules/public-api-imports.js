/**
 * @fileoverview Plugin for FSD public api path checking
 * @author zgibex
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/public-api-imports"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: "module" },
});
ruleTester.run("public-api-imports", rule, {
  valid: [
    {
      code: "import { classNames } from '../../classNames/classNames'",
      errors: [],
    },
    {
      options: [
        {
          alias: "@",
        },
      ],
      code: "import { classNames } from '@/entities/Article'",
      errors: [],
    },
  ],

  invalid: [
    {
      code: "import { classNames } from '@/entities/Article/ui'",
      options: [
        {
          alias: "@",
        },
      ],
      errors: [
        {
          message:
            "Absolute imports are allowed only from public API (except shared layer)",
        },
      ],
    },
  ],
});
