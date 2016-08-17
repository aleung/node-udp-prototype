import { UdpClient, Message } from '../src/udpclient';

function parse(msg: Buffer): Message {
    const tid = msg.readUInt8(0);
    console.log('Client receives response', tid);
    return {
        tid,
        data: msg
    };
}

export class EchoClient extends UdpClient {
    constructor() {
        super('127.0.0.1', 41234, parse);
    }
}
