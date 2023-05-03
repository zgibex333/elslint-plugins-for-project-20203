/**
 * @fileoverview fsd relative path checker
 * @author zgibex
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: "module" },
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: "C:\\work\\ulbi\\src\\entities\\Article",
      code: "import { classNames } from '../../classNames/classNames'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: "C:\\work\\ulbi\\src\\entities\\Article",
      code: "import { classNames } from '@/entities/Article/classNames/classNames'",
      options: [{ alias: "@" }],
      errors: [
        {
          message:
            "Imports should be relative in terms of same slice. Change it, Son!",
        },
      ],
    },
    {
      filename: "C:\\work\\ulbi\\src\\entities\\Article",
      code: "import { classNames } from 'entities/Article/classNames/classNames'",
      errors: [
        {
          message:
            "Imports should be relative in terms of same slice. Change it, Son!",
        },
      ],
    },
  ],
});
