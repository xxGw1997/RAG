# RAG Project

A full-stack Retrieval-Augmented Generation (RAG) application built with [Bun](https://bun.sh), [ElysiaJS](https://elysiajs.com), and [React](https://react.dev).

## Stack

- **Backend** — [ElysiaJS](https://elysiajs.com) API with [ChromaDB](https://www.trychroma.com/) vector store and [LangChain](https://js.langchain.com) + OpenAI for embeddings
- **Frontend** — [React](https://react.dev), [Vite](https://vite.dev), [TanStack Router](https://tanstack.com/router), [Tailwind CSS](https://tailwindcss.com), and [Eden](https://elysiajs.com/eden) for type-safe API calls
- **Shared** — Common types shared between apps

## Getting started

```bash
bun install
```

```bash
bun run dev
```

This starts both the backend (port 3000) and frontend (port 5173) concurrently.

- **Backend**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/swagger`
- **Frontend**: `http://localhost:5173`

## Structure

```
rag/
├── apps/
│   ├── backend/     # ElysiaJS server, ChromaDB, LangChain
│   └── frontend/    # React + Vite SPA
├── packages/
│   └── shared/      # Shared types and utilities
└── dev.ts           # Dev script to run both apps
```
