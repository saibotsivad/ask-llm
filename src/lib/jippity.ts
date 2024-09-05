import { EventEmitter } from 'node:events'
import { secrets } from '$lib/secrets'
import type { ChatMessage } from '$lib/types'

const DATA_LINE = /(data: (.+)|\[(DONE)])/g

const streamOut = async (emitter: EventEmitter, response: Response) => {
	if (!response.ok) {
		response.json().then(data => {
			console.log('ERROR', data)
			emitter.emit('cancel')
		})
	} else if (!response.body) {
		console.error('NO RESPONSE BODY')
		emitter.emit('cancel')
	} else {
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let {value, done} = await reader.read()
		let partial = ''
		while (!done) {
			const chunk = decoder.decode(value, {stream: true})
			let match
			while ((match = DATA_LINE.exec(chunk.toString())) !== null) {
				if (match[3] === 'DONE') {
					emitter.emit('finish')
				} else {
					let string = match[2]
					if (!string.endsWith('}')) {
						partial = string
					} else {
						if (partial) {
							string = partial + string
							partial = ''
						}
						let data
						try {
							data = JSON.parse(string)
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
						} catch (error) {
							console.error('Error parsing chunk line:', string)
						}
						if (data) {
							emitter.emit('response', data.choices[0].delta.content)
						}
					}
				}
			}
			;({value, done} = await reader.read())
		}
		console.log('ALL HAS BEEN READ')
		if (!done) emitter.emit('finish')
	}
}

export const ask = async (ac: AbortController, messages: ChatMessage[]): Promise<EventEmitter> => {
	const emitter = new EventEmitter()
	fetch(`${secrets.jippityBaseUrl}/v1/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${secrets.jippityApiKey}`
		},
		body: JSON.stringify({
			model: 'gpt-4o-mini',
			messages,
			stream: true,
		}),
		signal: ac.signal,
	})
		.then(response => streamOut(emitter, response))
		.catch(error => {
			if (error.name === 'AbortError') {
				console.log('Fetch aborted')
			} else {
				console.log('Fetch error:', error)
			}
		})
	return emitter
	// const data = await response.json()
	/* {
		"choices": [
			{
				"finish_reason": "stop",
				"index": 0,
				"message": {
					"content": "The 2020 World Series was played in Texas at Globe Life Field in Arlington.",
					"role": "assistant"
				},
				"logprobs": null
			}
		],
		"created": 1677664795,
		"id": "chatcmpl-7QyqpwdfhqwajicIEznoc6Q47XAyW",
		"model": "gpt-4o-mini",
		"object": "chat.completion",
		"usage": {
			"completion_tokens": 17,
			"prompt_tokens": 57,
			"total_tokens": 74
		}
	} */
	// console.log('RESPONSE', data)
	// if (data?.error?.message) return data?.error?.message
	// return data?.choices?.[0]?.message?.content
}
