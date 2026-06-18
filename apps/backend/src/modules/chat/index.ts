import { Elysia, t } from 'elysia'
import { AIChatService } from './service'

const chatService = new AIChatService()

export const chatAgent = new Elysia({ prefix: '/api', name: 'chat' })
  .post('/chat', async ({ body }) => {
    const messages = (body as any).messages ?? []
    return chatService.chat(messages)
  }, {
    body: t.Any(),
    detail: { summary: 'Chat with RAG enhancement (Vercel AI SDK)', tags: ['Chat'] },
  })
