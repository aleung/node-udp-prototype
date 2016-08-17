/// <reference types="node" />

import * as dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('error', (err: any) => {
  console.log(err);
  server.close();
});

// from @ses/common
function sleep(millisec: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, millisec);
  });
}

let delay: number[];
let replies = 1;

server.on('message', async (msg: Buffer, rinfo: any) => {
  console.log('Server receives message:', msg);
  const t = delay.shift();
  for (let i = 0; i < replies; i++) {
    if (t) {
      await sleep(t);
    }
    server.send(msg, rinfo.port, rinfo.address);
  }
});

server.bind(41234);

export function setDelay(millisec: number[]) {
  delay = millisec;
}

export function setReplies(n: number) {
  replies = n;
}

export function reset() {
  delay = [];
  replies = 1;
}