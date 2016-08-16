import {UdpClient, Message} from './udpclient';

function parse(msg: Buffer): Message {

}

const client = new UdpClient('127.0.0.1', 41234, parse);