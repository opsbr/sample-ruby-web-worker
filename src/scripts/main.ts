import { writeResponse } from "../util";
import MyWorker from "./worker?worker";

const log = (message: any) => {
  console.log(`  [main] ${message}`);
};

const worker = new MyWorker();
let array: Int32Array;
worker.onmessage = ({ data }) => {
  if (data instanceof SharedArrayBuffer) {
    array = new Int32Array(data);
  } else {
    log(`onmessage: ${data}`);
    if (data.includes("coffee")) {
      log(`Making coffee...`);
      setTimeout(() => {
        log(`Coffee is ready!`);
        writeResponse("Your coffee! ☕", array);
      }, 2000);
    }
    if (data.includes("beer")) {
      log(`Making beer...`);
      setTimeout(() => {
        log(`Beer is ready!`);
        writeResponse("Your beer! 🍺", array);
      }, 2000);
    }
  }
};

setInterval(() => {
  log("I'm alive!");
}, 100);