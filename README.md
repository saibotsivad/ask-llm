# ask-llm

This is a little project I'm working on for a [Tauri](https://tauri.app/) based app that is a sort of chatbot interface to an LLM.

At the moment it's SvelteKit pointed to ChatGPT, so you need to create `src/lib/secrets.ts` and make it look like this:

```ts
import { AskJippitySecrets } from '$lib/types'

export const secrets: AskJippitySecrets = {
	jippityApiKey: 'sk-...',
	jippityBaseUrl: 'https://api.openai.com',
}
```

My plan is to point it to a locally running LLM, but I also want to point it at other things so I'll probably make it a sort of plugin-ish thing.

## Developing

Install dependencies with `npm install` then:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```
