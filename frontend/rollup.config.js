import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/property-manager-panel.ts",
  output: {
    file: "../custom_components/property_manager/frontend/property-manager-panel.js",
    format: "es",
    sourcemap: !production,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript(),
    production && terser(),
  ],
};
