import {ask} from "$lib/jippity";
import {error} from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const q = url.searchParams.get('q') || ''
	if (!q) return error(404, 'Must include "q" query parameter.')

	const ac = new AbortController()

	const emitter = await ask(ac, [
		{
			role: 'system',
			content: 'You are a helpful assistant.'
		},
		{
			role: 'user',
			content: q
		}
	])

	const stream = new ReadableStream({
		start(controller) {
			emitter.on('response', (response: string) => {
				if (response !== undefined) controller.enqueue(response)
			})
			emitter.on('finish', () => {
				console.log('finishing')
				controller.close()
			})
			emitter.on('cancel', () => {
				console.log('cancelling')
				controller.close()
			})
		},
		cancel() {
			console.log("cancel and abort")
			ac.abort()
		},
	})

	return new Response(stream, {
		headers: { 'Content-Type': 'text/event-stream' }
	})
}
