import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, type DragEvent } from "react"
import { api } from "../eden"

export const Route = createFileRoute("/upload")({
  component: Upload,
})

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
]

const MAX_SIZE = 10 * 1024 * 1024

function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ status: string; md5: string; message: string } | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (f: File) => {
    if (!ALLOWED_TYPES.includes(f.type) && !f.name.endsWith(".md")) {
      setError(`Unsupported file type: ${f.type || "unknown"}`)
      return false
    }
    if (f.size > MAX_SIZE) {
      setError("File exceeds 10MB limit")
      return false
    }
    return true
  }

  const handleFile = (f: File) => {
    setError("")
    setResult(null)
    if (isValidFile(f)) {
      setFile(f)
    } else {
      setFile(null)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError("")
    setResult(null)

    try {
      const { data, error: reqError } = await api.api["knowledge-base"].upload.post({ file })
      if (reqError) {
        setError(reqError.value?.message || "Upload failed")
      } else if (data) {
        setResult(data)
        setFile(null)
      }
    } catch {
      setError("Network error")
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Upload Document</h2>
        <p className="text-sm text-gray-500 mb-4">
          Supports PDF, Word, Markdown, TXT, CSV &mdash; up to 10MB
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.csv"
            onChange={handleInputChange}
            className="hidden"
          />
          {file ? (
            <div className="space-y-1">
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="text-blue-600 font-medium">Click to browse</span> or drag a file here
              </p>
              <p className="text-xs text-gray-400">PDF, Word, Markdown, TXT, CSV</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className={`mt-4 p-3 border rounded-lg text-sm ${
            result.status === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}>
            <p className="font-medium">{result.message}</p>
            <p className="text-xs mt-1 font-mono">MD5: {result.md5}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  )
}
