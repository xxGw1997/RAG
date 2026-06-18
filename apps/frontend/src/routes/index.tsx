import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { api } from "../eden"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    api.api.get().then(({ data }) => {
      if (data) setMessage(data.message)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to RAG Project</h2>
        <p className="text-gray-600">Backend says: <span className="font-mono text-blue-600">{message || "Loading..."}</span></p>
      </div>
    </div>
  )
}
