import { OpenAIEmbeddings } from '@langchain/openai'

export class LangChainEmbeddingFunction {
  name = 'langchain-openai'
  private embeddings: OpenAIEmbeddings

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-v3',
      apiKey: process.env.EMBEDDING_API_KEY,
      configuration: {
        baseURL: process.env.EMBEDDING_BASE_URL
      },
    })
  }

  async generate(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts)
  }
  
  async generateForQueries(texts: string[]): Promise<number[][]> {
    const results = await Promise.all(texts.map(t => this.embeddings.embedQuery(t)))
    return results
  }
}
