/// <reference types="node" />

import * as dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(err);
  server.close();  
});

server.on('message', (msg, rinfo) => {
  server.send(msg, rinfo.port, rinfo.address);
});

server.bind(41234);