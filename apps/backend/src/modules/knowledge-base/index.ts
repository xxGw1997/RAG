import { Elysia, t } from 'elysia'
import { KnowledgeBaseService } from './service'

const knowledgeBaseService = new KnowledgeBaseService()

export const knowledgeBase = new Elysia({ prefix: '/api/knowledge-base', name: 'knowledge-base' })
  .post('/upload', async ({ body: { file } }) => {
    const buffer = Buffer.from(await file.arrayBuffer())
    return await knowledgeBaseService.upload(buffer, file.name)
  }, {
    body: t.Object({
      file: t.File({ maxSize: '10m' }),
    }),
    detail: { summary: 'Upload file to knowledge base', tags: ['Knowledge Base'] },
  })
