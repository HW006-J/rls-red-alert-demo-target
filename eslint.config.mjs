import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["scripts/**"],
  },
];

export default eslintConfig;
