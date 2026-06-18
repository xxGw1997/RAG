import { ChromaService } from '@/modules/chroma/service'
import { toMd5, checkMd5, saveMd5 } from '@/lib/md5'

export class KnowledgeBaseService {
  private chroma: ChromaService

  constructor() {
    this.chroma = ChromaService.getInstance()
  }

  async upload(content: string | Buffer, fileName: string) {
    const md5 = toMd5(content)
    const exists = await checkMd5(md5)
    if (exists) {
      return { status: 'duplicate', md5, message: 'File already uploaded' }
    }

    const now = new Date()
    const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    const collection = await this.chroma.getOrCreateCollection('knowledge_base')
    console.log({
      ids: [md5],
      documents: [content.toString()],
      metadatas: [{ source: fileName, create_time: createTime, operator: 'xxgw' }],
    })
    try {
      
      await collection.add({
        ids: [md5],
        documents: [content.toString()],
        metadatas: [{ source: fileName, create_time: createTime, operator: 'xxgw' }],
      })
      await saveMd5(md5)
      console.log(md5, 'end')
    } catch (error) {
      console.log(error)
    }

    return { status: 'success', md5, message: 'File uploaded and indexed' }
  }
}
