import rubyWasm from "../assets/ruby.wasm?url";
import rubyCode from "../assets/main.rb?raw";
import { WASI, useAll } from "uwasi";
import { waitResponse } from "../util";

const log = (message: any) => {
  console.log(`[worker] ${message}`);
};

const buffer = new SharedArrayBuffer(30 * Int32Array.BYTES_PER_ELEMENT);
const array = new Int32Array(buffer);
postMessage(buffer);

const wasi = new WASI({
  args: ["ruby.wasm", "-e", rubyCode],
  features: [useAll({
    stdin: () => {
      log(`stdin: (waiting)`);
      const response = waitResponse(array);
      log(`stdin: ${JSON.stringify(response)}`);
      return response;
    },
    stderr: (lines) => {
      if (!lines.startsWith("I need")) {
        console.error(lines);
        return;
      }
      log(`stderr: ${lines}`);
      postMessage(lines);
    },
  })],
});

WebAssembly.instantiateStreaming(fetch(rubyWasm), {
  wasi_snapshot_preview1: wasi.wasiImport,
}).then(({ instance }) => wasi.start(instance));
