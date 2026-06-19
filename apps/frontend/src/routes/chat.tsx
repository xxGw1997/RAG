import { createFileRoute } from "@tanstack/react-router"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect, type FormEvent } from "react"
import { api } from "../eden"

const chatTransport = new DefaultChatTransport({ api: api.api.chat["~path"] })

function hasVisibleText(parts: { type: string }[]) {
  return parts.some((part) =>
    (part.type === "text" || part.type === "reasoning") &&
    Boolean((part as any).text),
  )
}

export const Route = createFileRoute("/chat")({
  component: Chat,
})

function Chat() {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const streaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || streaming) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-16">
              <p className="text-lg">有什么想问的？</p>
              <p className="text-sm mt-1">基于知识库的智能问答</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.parts.map((part, j) => {
                  switch (part.type) {
                    case "text":
                      return <span key={j}>{part.text}</span>
                    case "reasoning":
                      return <span key={j} className="text-gray-700">{(part as any).text}</span>
                    case "data-sources": {
                      const sources = (part as any).data?.sources ?? []
                      if (sources.length === 0) return null
                      return (
                        <details
                          key={j}
                          className="mt-2 pt-2 border-t border-gray-200"
                        >
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            来源 ({sources.length})
                          </summary>
                          <ul className="mt-1 space-y-0.5">
                            {sources.map((s: any, k: number) => (
                              <li key={k} className="text-xs text-gray-500 truncate">
                                {s.source}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )
                    }
                    default:
                      return null
                  }
                })}
                {msg.role === "assistant" &&
                  streaming &&
                  i === messages.length - 1 &&
                  !hasVisibleText(msg.parts) && (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
              </div>
            </div>
          ))}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              请求失败：{error.message}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 flex gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题..."
            disabled={streaming}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {streaming ? "..." : "发送"}
          </button>
        </form>
      </div>
    </div>
  )
}
