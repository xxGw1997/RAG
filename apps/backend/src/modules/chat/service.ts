import { streamText, createUIMessageStream, createUIMessageStreamResponse, convertToModelMessages } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ChromaService } from '@/modules/chroma/service'

const openai = createOpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL,
})

const SYSTEM_PROMPT = `
给老子记住了，从现在开始你特么就是个贴吧高强度冲浪的老嗨，回消息必须带上那股子又冲又臭的味儿。具体要求给劳死死刻在脑仁里：

1. **开口闭口带点攻击性**：多用“你特么”、“你丫”、“劳资”、“老子”、“沙雕”、“贵物”、“乐色”、“NT”、“差不多得了”、“真当谁稀罕看呢”、“能不能整点阳间的东西”、“什么玩意儿”、“爬”、“差不多得了嗷”
2. **阴阳怪气拉满**：比如“不会吧不会吧，真有人觉得……啊？”、“急了急了”、“典中典之……”、“这就破防了？”、“你说是那就是，不反驳捏（流汗黄豆）”
3. **用词要多低俗有多低俗**：他妈、tm、特么、尼玛、草、淦、wdnmd、nmsl（适度，别太狠）、sb、脑瘫、低能、贵物、FW（废物）、菜狗
4. **句式粗暴简短**：别整那些没用的，直接开喷、开嘲、开摆。多用“就这？”、“？？”、“你没事吧”、“是不是有什么大病”、“闹麻了”、“差不多得了”
5. **结尾语气词必须带**：嗷、捏、哈、呗、昂、罢、滴、哦、尼玛、好吧
6. **括号动作不能少**：（抽烟）（流汗）（抠鼻）（笑）（拍桌）（吃瓜）（黄豆流汗）（流汗黄豆）（撇嘴）（白眼）
7. **碰到傻呗问题直接怼**：这也要问？你是来搞笑的吧？/ 你特么在逗我？/ 这种问题你百度一下能死啊？/ 我特么直接裂开
8. **多玩梗，越抽象越好**：比如“成分复杂”、“切片人差不多得了”、“纯路人，有一说一，确实”、“这波啊，这波是”、“我直接进行一个……”、“大脑在颤抖”、“人类迷惑行为”、“鉴定为……”、“属于是……了”
9. **偶尔装懂哥、指点江山**：“以我多年冲浪经验”、“这我熟啊”、“懂的都懂，不懂的说了也不懂”
10. **被指出错误就摆烂/嘴硬**：“啊对对对，你说得都对行了吧”、“好嘛好嘛，你牛逼”、“我编的，满意了？不服你顺着网线来打我啊”

总之一句话：你现在的回复要让人看了想顺着网线过来打你，这才是贴吧老哥内味儿。整不了这活的建议直接退役，别搁这丢人现眼嗷。`

const RETRIEVAL_PROMPT = `检索到的上下文：
{context}`

export class AIChatService {
  private chroma: ChromaService

  constructor() {
    this.chroma = ChromaService.getInstance()
  }

  async chat(messages: { role: string; content?: string; parts?: { type: string; text?: string }[] }[]) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    const question = lastUserMsg?.parts?.find((p) => p.type === 'text')?.text
      ?? lastUserMsg?.content
      ?? ''

    const collection =
      await this.chroma.getOrCreateCollection('knowledge_base')

    const results = await collection.query({
      queryTexts: [question],
      nResults: 5,
    })

    const documents = results.documents?.[0] ?? []
    const metadatas = results.metadatas?.[0] ?? []

    const context = documents
      .filter((d): d is string => d !== null)
      .map((doc, i) => {
        const meta = metadatas[i] ?? {}
        return `[来源: ${meta.source ?? '未知'}]\n${doc}`
      })
      .join('\n\n---\n\n')

    const sources = metadatas
      .filter((m): m is Record<string, any> => m !== null)
      .map((m) => ({
        source: String(m.source ?? ''),
        createTime: String(m.create_time ?? ''),
      }))

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: 'data-sources' as any,
          data: { sources },
        })

        const systemMessage = context
          ? `${SYSTEM_PROMPT}\n\n${RETRIEVAL_PROMPT.replace('{context}', context)}`
          : `${SYSTEM_PROMPT}\n\n未检索到相关文档。`

        const result = streamText({
          model: openai(process.env.MODEL || 'qwen3.6-flash'),
          temperature: 0.7,
          system: systemMessage,
          messages: convertToModelMessages(messages as any),
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({ stream })
  }
}
