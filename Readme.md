# Forxy



## Introduction

Forxy is a tool for port forwarding through proxy, it supports following types of proxy:

* http (https)
* socks4 (socks4a)
* socks (socks5 socks5h)

## How Do I Install It?

```shell
npm -g install forxy
```

## How Is It Used?

```
Usage: forxy [options]

Options:
  -V, --version                       output the version number
  -t, --target <host:port>            set target hostname and port
  -x, --proxy <protocol://host:port>  set the proxy url to connect to the target
  -b, --bind <addr:port>              bind an address and port to listen
  -h, --help                          output usage information
```

Suppose there is a service running on 20.0.0.1:80, and I have to access it via an HTTP proxy 10.0.0.1:8080, so I can run the following command to map 20.0.0.1:80 to local 127.0.0.1:80

```shell
forxy -t 20.0.0.1:80 -x http://10.0.0.1:8080 -b 127.0.0.1:80
```

