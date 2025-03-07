/*
	[
	{"role": "system", "content": "You are a helpful assistant."},
	{"role": "user", "content": "Who won the world series in 2020?"},
	{"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
	{"role": "user", "content": "Where was it played?"}
]
 */

export type ChatMessageRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
	id: string
	role: ChatMessageRole
	content: string
}

export interface AskJippitySecrets {
	jippityApiKey: string
	jippityBaseUrl: string
}
