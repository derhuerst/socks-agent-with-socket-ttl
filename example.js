'use strict'

const fetch = require('node-fetch')
const socksAgentWithSocketTTL = require('.')

const torSocks5Agent = socksAgentWithSocketTTL({
	// connect to local Tor node
	host: '127.0.0.1',
	port: 9050,
	// close sockets when they get 60s old
	socketTTL: 10 * 1000,
})

;(async () => {
	while (true) { // eslint-disable-line no-constant-condition
		const res = await fetch('https://wtfismyip.com/text', {
			agent: torSocks5Agent,
			headers: {
				'user-agent': '<identifier of your program>',
				'connection': 'keep-alive',
			},
		})
		const ip = (await res.text()).trim()
		console.log(new Date().toISOString(), 'public IP is', ip)

		await new Promise(r => setTimeout(r, 10 * 1000)) // wait for 10s
	}
})()
.catch((err) => {
	console.error(err)
	process.exit(1)
})
