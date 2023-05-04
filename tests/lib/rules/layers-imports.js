/**
 * @fileoverview desc
 * @author zgibex
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/layers-imports"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: "module" },
});
ruleTester.run("layers-imports", rule, {
  valid: [
    // give me some code that won't trigger a warning
    {
      filename:
        "C:\\work\\ulbi\\eslint-custom-plugins\\src\\app\\store\\index.ts",
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      options: [
        {
          alias: "@",
        },
      ],
    },
    {
      filename:
        "C:\\work\\ulbi\\frontend\\src\\shared\\lib\\components\\DynamicModuleLoader\\DynamicModuleLoader.tsx",
      code: "import { StateSchema, StateSchemaKey, } from '@/app/providers/storeProvider/config/StateSchema'",
      options: [
        {
          alias: "@",
          ignoreImportPatterns: ["**/storeProvider/**"],
        },
      ],
    },
  ],

  invalid: [
    {
      filename:
        "C:\\work\\ulbi\\eslint-custom-plugins\\src\\entities\\store\\index.ts",
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/app/Article'",
      options: [
        {
          alias: "@",
        },
      ],
      errors: [
        {
          message: "Layer can export only from lower layers",
        },
      ],
    },
  ],
});
