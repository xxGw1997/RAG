import { ChromaClient, AdminCloudClient, type EmbeddingFunction } from 'chromadb'
import { LangChainEmbeddingFunction } from '@/lib/embedding'

export class ChromaService {
  private static instance: ChromaService
  private client: ChromaClient
  private adminClient: AdminCloudClient
  private embeddingFn: EmbeddingFunction

  private constructor() {
    this.embeddingFn = new LangChainEmbeddingFunction()
    this.client = new ChromaClient({
      host: process.env.CHROMA_HOST || 'api.trychroma.com',
      port: 443,
      ssl: true,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
      headers: process.env.CHROMA_API_KEY
        ? { 'x-chroma-token': process.env.CHROMA_API_KEY }
        : undefined,
    })
    this.adminClient = new AdminCloudClient({
      apiKey: process.env.CHROMA_API_KEY,
      host: process.env.CHROMA_HOST || 'api.trychroma.com',
      port: 443,
    })
  }

  static getInstance(): ChromaService {
    if (!ChromaService.instance) {
      ChromaService.instance = new ChromaService()
    }
    return ChromaService.instance
  }

  getClient(): ChromaClient {
    return this.client
  }

  getEmbeddingFunction(): EmbeddingFunction {
    return this.embeddingFn
  }

  async ensureDatabase(): Promise<void> {
    const dbName = process.env.CHROMA_DATABASE
    if (!dbName) return

    const tenant = process.env.CHROMA_TENANT || 'default_tenant'
    const databases = await this.adminClient.listDatabases({ tenant })
    const exists = databases.some((db: any) => db.name === dbName)
    if (!exists) {
      await this.adminClient.createDatabase({ name: dbName, tenant })
    }
  }

  async getOrCreateCollection(name: string) {
    return await this.client.getOrCreateCollection({
      name,
      embeddingFunction: this.embeddingFn,
    })
  }

  async listCollections() {
    return await this.client.listCollections()
  }

  async heartbeat() {
    return await this.client.heartbeat()
  }
}
