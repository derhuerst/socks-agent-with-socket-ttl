# socks-agent-with-socket-ttl

**Node.js [SOCKS5](https://en.wikipedia.org/wiki/SOCKS#SOCKS5) [Agent](https://nodejs.org/api/http.html#class-httpagent) with a configurable sockets time to live (TTL).**

[![npm version](https://img.shields.io/npm/v/@derhuerst/socks-agent-with-socket-ttl.svg)](https://www.npmjs.com/package/@derhuerst/socks-agent-with-socket-ttl)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/socks-agent-with-socket-ttl.svg)
![minimum Node.js version](https://img.shields.io/node/v/socks-agent-with-socket-ttl.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installation

```shell
npm install @derhuerst/socks-agent-with-socket-ttl
```


## Usage

Let's say you want to send requests through the [Tor network](https://www.torproject.org), via your locally install Tor node, which exposes a [SOCKS5](https://en.wikipedia.org/wiki/SOCKS#SOCKS5) proxy on `127.0.0.1:9050`. You have configured it to pick a new *circuit* (the Tor term for the chain of Tor nodes your traffic is sent through) every 60s, *usually* giving you a new public IP every time; But that only applies to new sockets you're creating, exiting ones will keep their old circuit and thus their old public IP. Therefore, you want to keep sockets open (e.g. for [HTTP Keep-Alive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive)) for 60s, to improve response latency, but closes them every 60s to make use of your changing public IP.

```js
const socksAgentWithSocketTTL = require('@derhuerst/socks-agent-with-socket-ttl')
const fetch = require('node-fetch')

const torSocks5Agent = socksAgentWithSocketTTL({
	// connect to local Tor node
	host: '127.0.0.1',
	port: 9050,
	// close sockets when they get 60s old
	socketTTL: 60 * 1000,
})

while (true) {
	const res = await fetch('https://wtfismyip.com/text', {
		agent: torSocks5Agent,
		headers: {
			'user-agent': '<identifier of your program>',
			'connection': 'keep-alive',
		},
	})
	const ip = await res.text()
	console.log('public IP is', ip)

	await new Promise(r => setTimeout(r, 10 * 1000)) // wait for 10s
}
```


## Contributing

If you have a question or need support using `socks-agent-with-socket-ttl`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/socks-agent-with-socket-ttl/issues).
