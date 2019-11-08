const { FuseBox, EnvPlugin, CSSPlugin, JSONPlugin, WebIndexPlugin, QuantumPlugin } = require("fuse-box");
const { src, task, context } = require("fuse-box/sparky");

/*
 |--------------------------------------------------------------------------------
 | Context
 |--------------------------------------------------------------------------------
 */

context(
  class {
    getConfig() {
      return FuseBox.init({
        homeDir: "src",
        output: "public/$name.js",
        target: "browser@es5",
        sourceMaps: {
          inline: true
        },
        debug: "development",
        sourcemaps: "development",
        hash: this.isProduction,
        plugins: [
          JSONPlugin(),
          CSSPlugin(),
          EnvPlugin({ NODE_ENV: process.env.NODE_ENV }),
          WebIndexPlugin({
            template: "index.html",
            target: "index.html",
            bundles: ["app"]
          }),
          this.isProduction &&
            QuantumPlugin({
              bakeApiIntoBundle: "app",
              uglify: false,
              //css: { clean: true },
              extendServerImport: true
            })
        ],
        alias: {
          Engine: "~/Engine",
          Config: "~/App/Config"
        }
      });
    }

    createBundle(fuse) {
      const app = fuse.bundle("app");
      app.instructions("> index.tsx");
      if (!this.isProduction) {
        app.watch();
      }
      return app;
    }
  }
);

/*
 |--------------------------------------------------------------------------------
 | Clean
 |--------------------------------------------------------------------------------
 */

task("clean", async () => {
  await src(".fusebox")
    .clean(".fusebox")
    .exec();
});

/*
 |--------------------------------------------------------------------------------
 | Default
 |--------------------------------------------------------------------------------
 */

task("default", ["clean"], async context => {
  const fuse = context.getConfig();
  fuse.dev({ port: process.env.PORT || 3000, fallback: "index.html" });
  context.createBundle(fuse);
  await fuse.run();
});

/*
 |--------------------------------------------------------------------------------
 | Distribution
 |--------------------------------------------------------------------------------
 */

task("dist", ["clean"], async context => {
  context.isProduction = true;
  const fuse = context.getConfig();
  context.createBundle(fuse);
  await fuse.run();
});
