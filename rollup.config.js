// rollup 配置文件
import { eslint } from "rollup-plugin-eslint";
import commonjs from "rollup-plugin-commonjs";

import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";

const env = process.env.NODE_ENV;

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "umd",
    name: "renderKLine"
  },
  plugins: [
    babel({
      exclude: ["node_modules/**"]
    }),
    resolve(),
    commonjs({
      include: ["node_modules/**"]
    }),
    eslint({
      include: ["src/**/*.js"]
    }),
    env === "production" && uglify()
  ]
};