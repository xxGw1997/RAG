import { Elysia, t } from 'elysia'
import { LLMService } from './service'

const llmService = new LLMService()

export const llmAgent = new Elysia({ prefix: '/api/llm', name: 'llm' })
  .post('/ask', async ({ body: { question } }) => {
    return await llmService.ask(question)
  }, {
    body: t.Object({
      question: t.String({ minLength: 1 }),
    }),
    detail: { summary: 'Ask a question with RAG enhancement', tags: ['LLM'] },
  })
  .post('/ask/stream', async ({ body: { question } }) => {
    const stream = await llmService.askStream(question)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }, {
    body: t.Object({
      question: t.String({ minLength: 1 }),
    }),
    detail: { summary: 'Ask a question with streaming response', tags: ['LLM'] },
  })
