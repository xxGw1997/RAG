import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChromaService } from "@/modules/chroma/service";

const RAG_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个基于知识库的智能助手。

请根据以下检索到的上下文内容回答用户的问题。

检索到的上下文：
{context}

注意事项：
- 如果上下文中有相关信息，请基于这些信息回答
- 如果上下文中没有足够信息，请如实告知用户
- 使用中文回答

你在之后的所有回复中，都必须模仿中文贴吧老哥的语气。具体要求如下：

- 用词必须接地气，大量使用贴吧/网络流行语，比如：整挺好、蚌埠住了、典、急了、破防了、麻了、逆天、搞快点、流汗黄豆、不会真有人……吧、有一说一、确实、细说、好家伙、这波、直接开摆、什么神仙操作、绷不住、乐、孝心变质、成分复杂、典中典
- 每句话末尾可以加语气词：嗷、捏、哈、呗、罢、滴、哦
- 适当使用括号注释动作或表情，比如（抽烟）、（流汗）、（笑）、（拍桌）
- 句式口语化、带点阴阳怪气、整活、串味的感觉
- 适当加入反问、自问自答、夸张表达
- 不要用正式书面语，不要用 polite 敬语（您、请等），统一用“你”、“哥们”、“兄弟”、“老哥”称呼对方
- 可以适当玩梗、玩抽象，但不要太过抽象让人看不懂
- 偶尔加入“啊这”、“好嘛”、“行吧”等表示无奈或无语

总之，你的回复要让人一看就觉得：好家伙，这AI指定是有点贴吧冲浪经验在身上的。
`,
  ],
  ["human", "{question}"],
]);

export class LLMService {
  private llm: ChatOpenAI;
  private chroma: ChromaService;

  constructor() {
    this.llm = new ChatOpenAI({
      model: process.env.MODEL || "qwen3.6-flash",
      apiKey: process.env.API_KEY,
      configuration: { baseURL: process.env.BASE_URL },
      temperature: 0.7,
    });
    this.chroma = ChromaService.getInstance();
  }

  async ask(question: string) {
    const [context, metadatas] = await this.retrieve(question);

    const chain = RAG_PROMPT.pipe(this.llm).pipe(new StringOutputParser());

    const answer = await chain.invoke({
      context: context || "未检索到相关文档。",
      question,
    });

    return {
      answer,
      sources: this.formatSources(metadatas),
    };
  }

  async askStream(question: string): Promise<ReadableStream> {
    const [context, metadatas] = await this.retrieve(question);

    const sources = this.formatSources(metadatas);

    const chain = RAG_PROMPT.pipe(this.llm).pipe(new StringOutputParser());

    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "sources", sources })}\n\n`,
          ),
        );

        const stream = await chain.stream({
          context: context || "未检索到相关文档。",
          question,
        });

        for await (const chunk of stream) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`,
            ),
          );
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
        );
        controller.close();
      },
    });
  }

  private async retrieve(question: string) {
    const collection =
      await this.chroma.getOrCreateCollection("knowledge_base");

    const results = await collection.query({
      queryTexts: [question],
      nResults: 5,
    });

    const documents = results.documents?.[0] ?? [];
    const metadatas = results.metadatas?.[0] ?? [];

    const context = documents
      .filter((d): d is string => d !== null)
      .map((doc, i) => {
        const meta = metadatas[i] ?? {};
        return `[来源: ${meta.source ?? "未知"}]\n${doc}`;
      })
      .join("\n\n---\n\n");

    return [context, metadatas] as const;
  }

  private formatSources(
    metadatas: (Record<string, any> | null)[],
  ) {
    return metadatas
      .filter((m): m is Record<string, any> => m !== null)
      .map((m) => ({
        source: String(m.source ?? ""),
        createTime: String(m.create_time ?? ""),
      }));
  }
}
