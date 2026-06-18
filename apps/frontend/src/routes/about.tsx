import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/about")({
  component: About,
})

function About() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
      <p className="text-gray-600">
        A monorepo project using Bun, ElysiaJS, React, TanStack Router, and TailwindCSS.
      </p>
    </div>
  )
}
