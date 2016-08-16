/// <reference types="node" />

import * as dgram from 'dgram';

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};


async function tryMultipleTimes<T>(f: () => Promise<T>, tries: number): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await f();
    } catch (err) {
      if (attempt >= tries) {
        throw err;
      }
      console.error('Got error, retry.', err);
    }
    attempt++;
  }
}

export interface Message {
  tid: number | string;
  data: any;
}

export interface ReceiveConfig {
  timeout?: number;
  tries?: number;
}


export class UdpClient {

  private socket = dgram.createSocket('udp4');
  private receivers = new Map<number | string, Function>();

  constructor(private dstAddress: string, private dstPort: number, parse: (msg: Buffer) => Message) {
    this.socket.on('message', (buf: Buffer, rinfo: any) => {
      const msg = parse(buf);
      const receiver = this.receivers.get(msg.tid);
      if (receiver) {
        receiver(msg);
      } else {
        console.error(`No receiver for tid ${msg.tid}`);
      }
    });
    this.socket.bind();
  }

  close() {
    this.socket.close();
  }

  sendAndReceive(tid: number | string, msg: Buffer, receiveConfig?: ReceiveConfig): Promise<Message> {
    this.socket.send(msg, this.dstPort, this.dstAddress);

    const timeout = (receiveConfig && receiveConfig.timeout) ? receiveConfig.timeout : 1000;
    const tries = (receiveConfig && receiveConfig.tries) ? receiveConfig.tries: 1;
    return 
      tryMultipleTimes(() => this.receiveWait(tid, timeout), tries)
      .finally(() => {
        this.receivers.delete(tid);
      });
  }


  private receiveWait(tid: number | string, timeout: number): Promise<Message> {
    return new Promise((resolve, reject) => {
      this.receivers.set(tid, resolve);
      setTimeout(() => reject(new Error('timeout')), timeout);
    });
  }

}
