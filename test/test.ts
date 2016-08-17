/// <reference types="mocha" />
/// <reference types="chai" />

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {setDelay, setReplies, reset} from './echoserver';
import {EchoClient} from './echoclient';

const expect = chai.use(chaiAsPromised).expect;

describe('udpclient', () => {

  let client: EchoClient;

  beforeEach(() => {
    client = new EchoClient();
  });

  afterEach(() => {
    client.close();
    reset();
  });

  it('correlate request and response by tid', async () => {
    setDelay([30]); // the reponse to first request will be delayed 30ms
    const p1 = client.sendAndReceive(1, Buffer.from([1]));
    const p2 = client.sendAndReceive(2, Buffer.from([2]));
    const [response1, response2] = await Promise.all([p1, p2]);
    expect(response1.tid).to.equal(1);
    expect(response2.tid).to.equal(2);
  });

  it('throw timeout error', () => {
    setDelay([200]);
    expect(client.sendAndReceive(10, Buffer.from([10]), {timeout: 100}))
      .to.be.rejectedWith(/timeout/);
  });

  it('retry on error', async () => {
    setDelay([200, 200]); // first two requests should be timeout
    const r = await client.sendAndReceive(10, Buffer.from([10]), {timeout: 100, tries: 3});
    expect(r.tid).to.equal(10);
  });

  it('ignore repeated response', async () => {
    setReplies(3);
    setDelay([25, 10]);
    const p1 = client.sendAndReceive(1, Buffer.from([1]));
    const p2 = client.sendAndReceive(2, Buffer.from([2]));
    const [response1, response2] = await Promise.all([p1, p2]);
    expect(response1.tid).to.equal(1);
    expect(response2.tid).to.equal(2);
  });

  it('ignore timeouted response', async () => {
    setReplies(3);
    setDelay([25, 10]);
    const p1 = client.sendAndReceive(1, Buffer.from([1]));
    const p2 = client.sendAndReceive(2, Buffer.from([2]), {timeout: 5});
    const response1 = await p1;
    expect(response1.tid).to.equal(1);
    expect(p2).to.be.rejected;
  });

});