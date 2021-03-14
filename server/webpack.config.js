const webpack = require("webpack");
const fs = require("fs");
const deepMerge = require("deep-merge");

const merge = deepMerge(function (target, source, key) {
  if (target instanceof Array) {
    return [].concat(target, source);
  }
  return source;
});
const defaultConfig = {
  module: {
    output: {
      // Treat this as being relative to package.json.
      // So basically our project directory.
      path: "./",
    },
    resolve: {
      // Look for modules in these places...
      modules: [path.resolve(__dirname, "./node_modules")],

      // Settings so filename extension isn't required when importing.
      extensions: [".js"],
    },
    loaders: [
      {
        // Run all JavaScript through Babel with our favorite presets.
        test: /\.js$/,
        loader: "babel-loader",
        // Skip node_modules and bower_components directories.
        // Those shouldn't need to run through Babel.
        exclude: /(node_modules|bower_components)/,
      },
    ],
  },
  devtool: "inline-source-map",
  // `source-map-support` causes problems unless you keep this out of the bundle.
  node: {
    fs: "empty",
    __dirname: true,
  },
};
if (process.env.NODE_ENV !== "production") {
  defaultConfig.devtool = "source-map";
  defaultConfig.debug = true;
}
function config(overrides) {
  return merge(defaultConfig, overrides || {});
}
const externals = {};
fs.readdirSync("./node_modules")
  .filter(function (x) {
    return [".bin"].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    externals[mod] = "commonjs " + mod;
  });

// Complete backend configuration object.
const backendConfig = config({
  entry: {
    backend: [path.resolve(__dirname, "./index.js")],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js",
  },
  // This is how webpack knows to compile for Node.js and not the browser.
  target: "node",
  // Remember that list of node modules we just built?
  // This is us telling webpack not to bundle them.
  externals: externals,
  plugins: [
    // For frontend builds we use `import './something.scss'` to include a style dependency.
    // Which works because of `sass-loader`.
    // We don't use that for backend.
    // This plugin ensures those imports don't cause runtime errors server-side.
    new webpack.NormalModuleReplacementPlugin(/\.(css|scss|sass)/, "node-noop"),
  ],
});
module.exports = [Object.assign({}, backendConfig)];
