const cli = require('commander');
const ver = require('../package.json').version;
const net = require('net');
const forxy = require('..');

cli.version(ver)
  .option('-t, --target <host:port>', 'set target hostname and port',
    /^[\w.-]+:\d+$/)
  .option('-x, --proxy <protocol://host:port>', 'set the proxy url to connect to the target',
    /^(https?|socks(4a?|5h?)?):\/\/[\w.-]+:\d+$/i)
  .option('-b, --bind <addr:port>', 'bind an address and port to listen',
    /^(\d{1,3}(\.\d{1,3}){3}|[0-9a-f:]+):\d+$/i)
  .parse(process.argv);

if (!check(cli)) {
  console.log(`try 'forxy -h' for more information`);
} else {
  run(cli);
}

function check(opts) {
  let keys = ['target', 'proxy', 'bind'];
  for (let key of keys) {
    let val = opts[key];
    if (!val) {
      console.log(`--${key} is required`);
      return false;
    } else if (val === true) {
      console.log(`invalid format of '${key}'`);
      return false;
    }
  }
  return true;
}

function run(opts) {
  if (opts.target && opts.proxy && opts.bind) {
    let addrPort = opts.bind.split(':');
    let port = Number(addrPort[1]);
    let addr = addrPort[0] || '0.0.0.0';
    let handle = forxy.bind(undefined, opts.proxy, opts.target);

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
}
