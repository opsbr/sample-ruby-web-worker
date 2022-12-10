import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import tar from "tar";

const RELEASE = "2022-12-09-a";
const BUILD = "head-wasm32-unknown-wasi-full";
const URL = `https://github.com/ruby/ruby.wasm/releases/download/${RELEASE}/ruby-${BUILD}.tar.gz`;

const assetsDir = join("src", "assets");
const rubyWasm = join(assetsDir, "ruby.wasm");

const main = async () => {
  if (existsSync(rubyWasm)) return;

  const response = await fetch(URL);
  await promisify(pipeline)(
    response.body,
    tar.x({
      filter: (path) => {
        return path === `${BUILD}/usr/local/bin/ruby`;
      },
      strip: 4,
      cwd: assetsDir,
    })
  );

  await rename(join(assetsDir, "ruby"), rubyWasm);
};

await main();
