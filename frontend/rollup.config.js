import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/property-manager-panel.ts",
  output: {
    file: "../custom_components/property_manager/frontend/property-manager-panel.js",
    format: "es",
    sourcemap: !production,
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      clean: true,
    }),
    production && terser(),
  ],
};
