<script lang="ts">
	import Message from '$lib/Message.svelte'
	import type { ChatMessage } from '$lib/types'

	const OPTIONS = {
		submitOnEnter: true,
	}

	let messages: ChatMessage[] = []

	let controller: AbortController
	const getStream = async (query: string) => {
		messages = [
			{
				id: Math.random().toString(),
				role: 'user',
				content: query,
			},
			...messages,
		]
		controller = new AbortController()
		try {
			const response = await fetch('/ask?q=' + encodeURIComponent(query), {signal: controller.signal})
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
			messages = [
				{
					id: Math.random().toString(),
					role: 'assistant',
					content: '',
				},
				...messages,
			]
			while (true) {
				const {value, done} = await reader.read()
				if (value) {
					messages[0].content += value
				}
				if (done) break
			}
		} catch (error: unknown) {
			messages = [
				{
					id: Math.random().toString(),
					role: 'system',
					content: (error as Error).message,
				},
				...messages
			]
		}
	}
	const windowKeydownHandler = (event: KeyboardEvent) => {
		if (event.keyCode === 27 || event.key === 'Escape') controller?.abort()
	}

	let prompt = ''
	const submit = () => {
		const copy = prompt
		prompt = ''
		setTimeout(() => {
			getStream(copy)
		})
	}

	let controlDown = false
	let metaDown = false
	let shiftDown = false
	const enterHandler = (event: KeyboardEvent) => {
		if (OPTIONS.submitOnEnter && !controlDown && !metaDown && !shiftDown) {
			event.preventDefault()
			event.stopPropagation()
			submit()
		}
	}
	const keydownHandler = (event: KeyboardEvent) => {
		if (event.keyCode === 17 || event.key === 'Control') metaDown = true
		if (event.keyCode === 224 || event.key === 'Meta') metaDown = true
		if (event.keyCode === 16 || event.key === 'Shift') shiftDown = true
		if (event.keyCode === 13 || event.key === 'Enter') enterHandler(event)
	}
	const keyupHandler = (event: KeyboardEvent) => {
		if (event.keyCode === 17 || event.key === 'Control') metaDown = false
		if (event.keyCode === 224 || event.key === 'Meta') metaDown = false
		if (event.keyCode === 16 || event.key === 'Shift') shiftDown = false
	}
</script>

<style>
	/* === STICKY FOOTER === */
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	:global(html, body) {
		height: 100vh;
	}
	:global(body) {
		display: flex;
		flex-direction: column;
	}
	main {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	div {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column-reverse;
	}
	/* === GROWING FOOTER === */
	/* https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/ */
	footer {
		display: grid;
	}
	footer::after {
		/* Note the weird space! Needed to preventy jumpy behavior */
		content: attr(data-replicated-value) " ";
		/* This is how textarea text behaves */
		white-space: pre-wrap;
		/* Hidden from view, clicks, and screen readers */
		visibility: hidden;
	}
	textarea {
		/* You could leave this, but after a user resizes, then it ruins the auto sizing */
		resize: none;
		/* Firefox shows scrollbar on growth, you can hide like this. */
		overflow: hidden;
	}
	footer > textarea,
	footer::after {
		/* Identical styling required!! */
		padding: 1rem;
		margin: 0;
		border: none;
		border-radius: 4px;
		background-color: #fff;
		font-size: 1rem;
		/* Place on top of each other */
		grid-area: 1 / 1 / 2 / 2;
	}
	/* === STYLE === */
	footer {
		background-color: #d7ddf2;
		padding: 1em;
	}
</style>

<svelte:window on:keydown={windowKeydownHandler} />

<main>
	<!--
	<header>
		<p>header part</p>
	</header>
	-->
	<div>
		{#each messages as message (message.id)}
			<Message id={message.id} role={message.role} content={message.content} />
		{/each}
	</div>
	<footer>
		<textarea
			bind:value={prompt}
			on:keydown={keydownHandler}
			on:keyup={keyupHandler}
			oninput="this.parentNode.dataset.replicatedValue = this.value"
		/>
	</footer>
</main>

