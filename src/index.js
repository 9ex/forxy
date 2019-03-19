const HttpProxy = require('./http');
const SocksProxy = require('./socks');

const PROTO_MAP = {
  'http:': HttpProxy,
  'https:': HttpProxy,
  'socks:': SocksProxy,
  'socks4:': SocksProxy,
  'socks4a:': SocksProxy,
  'socks5:': SocksProxy,
  'socks5h:': SocksProxy
};

function createConnection(proxyUrl, target, fn) {
  if (typeof target !== 'string') {
    throw new Error('invalid target: ' + target);
  }

  if (!proxyUrl) {
    throw new Error('proxyUrl is required');
  }

  let targetUrl = new URL('x://' + target);
  let targetHost = targetUrl.hostname;
  let targetPort = Number(targetUrl.port) || 80;

  let pxyOpts = new URL(proxyUrl);
  let Proxy = PROTO_MAP[pxyOpts.protocol];
  if (!Proxy) {
    throw new Error('unsupport protocol: ' + pxyOpts.protocol);
  }
  let proxy = new Proxy(pxyOpts);

  let promise = proxy.connect(targetHost, targetPort);
  if (typeof fn === 'function') {
    promise.then(socket => fn(null, socket), err => fn(err));
  } else {
    return promise;
  }
}

function transfer(proxyUrl, target, input, output) {
  if (!output) {
    output = input;
  }

  return createConnection(proxyUrl, target)
    .then(socket => {
      input.pipe(socket);
      socket.pipe(output);
      socket.on('error', err => {
        input.emit('error', err);
        if (output !== input) {
          output.emit('error', err);
        }
      });
    }, err => {
      input.emit('error', err);
      if (output !== input) {
        output.emit('error', err);
      }
    });
}

module.exports = exports = transfer;
exports.connect = createConnection;
exports.createConnection = createConnection;
