'use strict'

const debug = require('debug')('socks-agent-with-ttl')
const Socks5Agent = require('socksv5/lib/Agents').HttpsAgent
const socks5NoAuth = require('socksv5/lib/auth/None')
const socks5UserPassAuth = require('socksv5/lib/auth/UserPassword')

const createSocksAgentWithSocketTTL = (opt = {}) => {
	const {
		agentOpts,
		host,
		port,
		auth,
		socketTTL,
	} = {
		agentOpts: {},
		host: 'localhost',
		port: 1080, // https://datatracker.ietf.org/doc/html/rfc1928#section-3
		auth: null,
		socketTTL: Infinity,
		...opt,
	}

	let auths
	if (auth === null) {
		auths = [socks5NoAuth()]
	} else if ('function' === typeof auth) {
		auths = [socks5UserPassAuth(auth)]
	} else {
		throw new TypeError('opt.auth must be a function or null')
	}

	const socksAgent = new Socks5Agent({
		...agentOpts,
		proxyHost: host,
		proxyPort: port,
		auths,
		keepAlive: true,
		keepAliveMsecs: 30 * 1000,
	})

	if (socketTTL !== Infinity) {
		const firstSeen = new WeakMap() // socket -> tFirstSeen
		const onSocketFree = (socket) => {
			if (!firstSeen.has(socket)) {
				firstSeen.set(socket, Date.now())
				return;
			}

			// todo: this check shouldn't just happen whenever `free` fires!
			if ((Date.now() - firstSeen.get(socket)) >= socketTTL) {
				debug('socket too old, closing', socket.localAddress, socket.localPort)
				socket.destroy()
			}
		}
		socksAgent.on('free', onSocketFree)
	}

	return socksAgent
}

module.exports = createSocksAgentWithSocketTTL
