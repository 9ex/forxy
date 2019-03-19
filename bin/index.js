const cli = require('commander');
const ver = require('../package.json').version;
const net = require('net');
const forxy = require('..');

cli.version(ver)
  .option('-t, --target <host:port>', 'set target hostname and port')
  .option('-x, --proxy <protocol://host:port>', 'set the proxy url to connect to the target')
  .option('-b, --bind <addr:port>', 'bind an address and port to listen')
  .parse(process.argv);

if (cli.target && cli.proxy && cli.bind) {
  let addrPort = cli.bind.split(':');
  let port = Number(addrPort[1]);
  let addr = addrPort[0] || '0.0.0.0';
  let handle = forxy.bind(undefined, cli.proxy, cli.target);

  let server = net.createServer(socket => {
    socket.on('error', err => {
      socket.destroy();
      console.error(err);
    });
    handle(socket);
  }).listen(port, addr, () => {
    let address = server.address();
    console.log(`server started at ${address.address}:${address.port}`);
  });
}
