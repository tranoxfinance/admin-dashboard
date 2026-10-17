import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#(\\d|a|b|c|d|e|f|A|B|C|D|E|F){6}\\b/]",
          message: "Use a theme token or CHART_COLORS from @/lib/chart-colors.",
        },
        {
          selector:
            "TemplateElement[value.raw=/#(\\d|a|b|c|d|e|f|A|B|C|D|E|F){6}\\b/]",
          message: "Use a theme token or CHART_COLORS from @/lib/chart-colors.",
        },
        {
          selector:
            "Literal[value=/\\b(bg|text|border|ring)-(red|green|emerald|amber|yellow|orange|blue|sky|slate|gray|zinc)-\\d{2,3}\\b/]",
          message: "Use the success, warning, info or destructive tokens.",
        },
        {
          selector: "Literal[value=/text-\\[(\\d|\\.)+px\\]/]",
          message: "Use a text size token such as text-2xs.",
        },
        {
          selector:
            "Literal[value=/\\bbg-(green|gold|brand) text-white\\b/]",
          message:
            "Use a Badge or Button variant instead of hand-coloured classes.",
        },
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name=/^(confirm|alert)$/]",
          message: "Use ConfirmDialog or a toast.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
