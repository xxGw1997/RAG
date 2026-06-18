import { createRootRoute, Link, Outlet } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6">
          <h1 className="font-bold text-lg text-gray-800">RAG Project</h1>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-medium">
            Home
          </Link>
          <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-medium">
            About
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  ),
})
