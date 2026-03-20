import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import reactPlugin from "eslint-plugin-react";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                fetch: "readonly",
                URL: "readonly",
                Event: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                Image: "readonly",
                Blob: "readonly",
                FormData: "readonly",
                File: "readonly",
                alert: "readonly",
                IntersectionObserver: "readonly",
                // react globals
                React: "readonly",
                process: "readonly"
            }
        },
        plugins: {
            "unused-imports": unusedImports,
            "react": reactPlugin
        },
        rules: {
            "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    "vars": "all",
                    "varsIgnorePattern": "^_",
                    "args": "after-used",
                    "argsIgnorePattern": "^_",
                },
            ],
            "no-undef": "warn",
            "react/jsx-uses-vars": "error",
            "react/jsx-uses-react": "error"
        },
    },
];