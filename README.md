## ⚡ Key Highlights

* **Real-time Engine:** Powered by **Cloudflare Durable Objects** (Partyserver) for sub-100ms latency.
* **AI-First UX:** Integrated **OpenRouter & Vercel AI SDK** for smart message composing and thread summarization.
* **Enterprise Auth:** Multi-tenant architecture using **Kinde Organizations**.
* **Security:** Layered protection with **Arcjet WAF**, Bot detection, and PII scanning.

---

## 🏗 Architecture & Tech Stack

### Core Framework
* **Next.js 15 (App Router)** & **React 19** (Server Components, Actions).
* **TypeScript** for end-to-end type safety.
* **oRPC & Zod:** Type-safe API layer for seamless Client-Server communication.

### Data & Real-time
* **Database:** PostgreSQL via **Prisma ORM**.
* **Real-time & Presence:** **Partyserver** + Cloudflare Durable Objects for scalable WebSockets.
* **State Management:** **TanStack Query v5** for optimistic UI updates and cache synchronization.

### UI & UX
* **Editor:** **TipTap** Rich Text Editor with custom extensions and HTML sanitization.
* **Styling:** **Tailwind CSS v4** & **Radix UI** primitives.
* **Media:** High-speed image uploads via **Uploadthing**.

---

## 🛠 Technical Deep Dive: Challenges & Solutions

### 1. Synchronizing Real-time State with TanStack Query
* **Challenge:** Keeping the UI consistent across multiple tabs when a new message or reaction arrives via WebSockets.
* **Solution:** Implemented a custom `RealtimeProvider` that intercepts Partyserver events to manually update the TanStack Query cache. This enables **Optimistic Updates**, making the UI feel instantaneous.

### 2. Multi-tenant Routing & Security
* **Challenge:** Ensuring data isolation and dynamic routing based on Kinde Organizations.
* **Solution:** Built a middleware-level redirect system that validates session tokens against `org_code`, ensuring users can only access their authorized `/workspace/[workspaceId]` context.

### 3. Edge-ready AI Streaming
* **Challenge:** Long-running AI tasks (like summarizing a 50-message thread) blocking the UI.
* **Solution:** Utilized **Vercel AI SDK's `streamText`** combined with OpenRouter. The summary is streamed directly to the Sidebar, allowing users to continue chatting while the AI works.

---

## 🛡 Security & Resilience
* **Arcjet Integration:** Implemented specialized rules for rate limiting (shielding expensive AI routes) and bot protection.
* **Data Integrity:** Zod schemas shared between client and server to prevent malformed data injection.
* **XSS Protection:** Strict HTML sanitization on all Rich Text content before rendering.
