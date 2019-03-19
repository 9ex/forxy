const SocksClient = require('socks');
const dns = require('dns');
const util = require('util');

const localLookup = hostname => Promise.resolve(hostname);
const serverLookup = util.promisify(dns.lookup);

function Proxy(opts) {
  if (!(this instanceof Proxy)) {
    return new Proxy(opts);
  }

  if (!opts || (!opts.hostname && !opts.host) || !opts.port) {
    throw new TypeError('invalid socks proxy options');
  }

  this.host = opts.hostname || opts.host;
  this.port = opts.port;
  this.lookup = null;

  switch (opts.protocol) {
    case 'socks4:':
      this.lookup = serverLookup;
      this.type = 4;
      break;
    case 'socks4a:':
      this.lookup = localLookup;
      this.type = 4;
      break;
    case 'socks5:':
      this.lookup = serverLookup;
      this.type = 5;
      break;
    case 'socks:':
    case 'socks5h:':
      this.lookup = localLookup;
      this.type = 5;
      break;
    default:
      throw new Error('Unsupport protocol: ' + opts.protocol);
  }
}

Proxy.prototype.connect = function (targetHost, targetPort, socket) {
  return this.lookup(targetHost)
    .then(target => {
      return SocksClient.createConnection({
        proxy: {
          host: this.host,
          port: this.port,
          type: this.type
        },
        command: 'connect',
        destination: {
          host: target,
          port: targetPort
        },
        existing_socket: socket
      });
    })
    .then(info => info.socket);
};

module.exports = Proxy;
