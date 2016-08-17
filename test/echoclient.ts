import {UdpClient, Message} from '../src/udpclient';

function parse(msg: Buffer): Message {
    // TODO
}

const client = new UdpClient('127.0.0.1', 41234, parse);

client.sendAndReceive(1, Buffer.from([1]), {tries: 3}).then((msg: Message) => {
    // TODO
});
