const http = require('http');
const https = require('https');

function Proxy(opts) {
  if (!(this instanceof Proxy)) {
    return new Proxy(opts);
  }

  if (!opts || (!opts.hostname && !opts.host) || !opts.port) {
    throw new TypeError('invalid socks proxy options');
  }

  this.host = opts.host;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.protocol = opts.protocol;
}

Proxy.prototype.connect = function (targetHost, targetPort, socket) {
  let proto = this.protocol === 'https:' ? https : http;
  let opts = {
    method: 'CONNECT',
    path: targetHost + ':' + targetPort,
    createConnection: socket ? () => socket : null,
    host: this.host,
    hostname: this.hostname,
    port: this.port
  };

  return send(proto, opts).then(res => {
    if (res.statusCode !== 200) {
      let err = new Error(`Proxy returned an error: (${res.statusCode}) ${res.statusMessage}`);
      return Promise.reject(err);
    }
    return res.socket;
  });
};

function send(proto, options) {
  return new Promise((resolve, reject) => {
    let req = proto.request(options);
    req.on('connect', res => {
      res.once('error', reject);
      let chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: Buffer.concat(chunks),
          socket: res.socket
        });
      });
    });
    req.once('error', reject);
    req.end();
  });
}

module.exports = Proxy;
