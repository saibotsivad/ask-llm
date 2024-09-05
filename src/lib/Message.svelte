<script lang="ts">
	import type { ChatMessageRole } from '$lib/types'

	export let id: string
	export let role: ChatMessageRole
	export let content: string
</script>

<style>
	div {
		margin: 1em;
		padding: 1em;
		font-size: 1.1em;
		font-family: Helvetica, "Helvetica Neue", sans-serif;
	}
	div.role-assistant {
		margin-left: 6em;
	}
	div.role-user {
		background-color: #e3d7c9;
		margin-right: 8em;
		border-radius: 6px
	}
</style>

<div {id} class="role-{role}">
	{content}
</div>
