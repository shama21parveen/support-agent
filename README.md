<div align="center">

# 🤖 NOVA

### *Support that actually listens.*

An AI customer support agent that checks orders, answers from real policies, and raises tickets. No hold music.

![React](https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/VITE-1a1a2e?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Framer Motion](https://img.shields.io/badge/FRAMER_MOTION-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/NODE.JS-1a1a2e?style=for-the-badge&logo=nodedotjs&logoColor=6CC24A)
![Express](https://img.shields.io/badge/EXPRESS-1a1a2e?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MONGODB-1a1a2e?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Gemini](https://img.shields.io/badge/GEMINI_API-1a1a2e?style=for-the-badge&logo=googlegemini&logoColor=8E75B2)

| 🔴 Live Demo | 🧠 Agent Tools | 📚 Policy Docs |
|:---:|:---:|:---:|
| **Dropping soon** 🚧<br>_still being deployed_ | **3 tools**<br>_order, policy, ticket_ | **5 and counting**<br>_refund, return, shipping..._ |

</div>

---

## ✨ What is this?

**Nova** is an AI support agent for a fictional e-commerce store. A customer can write in English, Hindi or Hinglish, and Nova will:

- 📦 look up the **real order status** from the database,
- 📜 answer **policy questions** only from the store's own documents (no guessing),
- 🎫 **create a support ticket** when it cannot solve the problem or the customer asks for a human.

Nova is not just a chatbot that talks. It **decides when to use a tool**, runs it, reads the result and then replies.

---

## 🧠 How the agent works

```
Customer: "Refund kitne din mein milta hai?"
        │
        ▼
 Nova thinks: "I need the policy"  ──►  calls search_policy("refund")
        │
        ▼
 MongoDB text search  ──►  "Refund Policy" doc found
        │
        ▼
 Nova reads the doc  ──►  "Approved refunds reach you in 5-7 working days"
```

This loop (model asks for a tool → server runs it → result goes back → model answers) repeats until Nova has a final answer.

---

## 🧰 Tools

| Tool | What it does | Status |
|---|---|---|
| `get_order_status` | Fetches status, items and ETA for an order ID | ✅ Working |
| `search_policy` | Keyword search over policy docs (RAG) | ✅ Working |
| `create_ticket` | Creates a support ticket and returns a ticket ID | ✅ Working |

---

## 🎬 Features

### Backend (done)

- 🔌 **REST API** with Express and a `/health` check
- 💾 **Conversation memory** stored in MongoDB, so Nova remembers earlier messages
- 🛠️ **Tool calling** with an agent loop (up to 5 steps per message)
- 📚 **RAG** using MongoDB text indexes to pull the right policy before answering
- 🎯 **Grounded answers**: if a policy does not mention something (for example crypto payments), Nova says so instead of making it up
- 🔁 **Retry with exponential backoff** for 503 / 429 errors from the model API
- 🌐 **Multilingual**: replies in the same language the customer uses

### Frontend (in progress)

- 💬 Glassmorphism chat window
- ⌨️ Typing dots and streaming replies _(coming soon)_
- 🪄 Animated tool cards: order timeline (Packed → Shipped → Out for delivery → Delivered) _(coming soon)_
- 💡 Suggestion chips _(coming soon)_
- 🌅 Scroll storytelling landing page _(coming soon)_
- 🛍️ Demo store page with a floating Nova button _(coming soon)_
- 🔮 Nova orb that reacts to idle / thinking / answering _(coming soon)_

---

## 🗺️ Status

| Part | What | Status |
|---|---|---|
| Backend | Express + MongoDB + chat memory | ✅ Done |
| Backend | Tool calling + agent loop | ✅ Done |
| Backend | RAG policy search | ✅ Done |
| Backend | Streaming replies (SSE) | 🚧 Coming soon |
| Backend | JWT auth + rate limiting | 🚧 Coming soon |
| Backend | LRU cache for repeated FAQs | 🚧 Coming soon |
| Backend | Own BM25 / TF-IDF search | 🚧 Coming soon |
| Frontend | Chat UI | 🚧 In progress |
| Frontend | Landing page + store | 🚧 Coming soon |
| Deploy | Vercel (frontend) + Render (backend) | 🚧 Coming soon |

---

## 📁 Project Structure

```
support-agent/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── models/
│   │   │   ├── Conversation.js        # chat history
│   │   │   ├── Order.js               # orders
│   │   │   ├── Ticket.js              # support tickets
│   │   │   └── KnowledgeDoc.js        # policy documents (text indexed)
│   │   ├── routes/
│   │   │   └── chat.routes.js         # POST /api/chat
│   │   ├── controllers/
│   │   │   └── chat.controller.js     # request handling + saving history
│   │   ├── services/
│   │   │   ├── llm.service.js         # Gemini call + agent loop + retry
│   │   │   └── tools.js               # tool definitions + tool logic
│   │   ├── seed.js                    # dummy orders
│   │   ├── seedDocs.js                # policy docs
│   │   └── server.js                  # app entry
│   ├── .env                           # (not committed)
│   └── package.json
└── frontend/                          # React + Vite (in progress)
```

---

## 🧭 API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Server health check |
| `POST` | `/api/chat` | Send a message, get Nova's reply |

**Request**

```json
{ "message": "ORD1001 ka status batao", "conversationId": "optional" }
```

**Response**

```json
{ "reply": "Aapka order ship ho chuka hai...", "conversationId": "665f..." }
```

Send the returned `conversationId` back with the next message to keep the conversation going.

---

## 🚀 Run it locally

**1. Clone and install**

```bash
git clone https://github.com/shama21parveen/support-agent.git
cd support-agent/backend
npm install
```

**2. Create `backend/.env`**

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

**3. Add sample data**

```bash
node src/seed.js        # 4 dummy orders
node src/seedDocs.js    # 5 policy documents
```

**4. Start the server**

```bash
npm run dev
```

You should see:

```
MongoDB connected
Server running on port 5000
```

**5. Try it**

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Refund kitne din mein milta hai?"}'
```

Sample order IDs to test with: `ORD1001`, `ORD1002`, `ORD1003`, `ORD1004`.

---

## 🧪 Things to try

| Say this | What Nova does |
|---|---|
| `ORD1001 ka status batao` | Calls `get_order_status` |
| `Refund kitne din mein milta hai?` | Calls `search_policy`, answers from the Refund Policy |
| `Free shipping kab milti hai?` | Answers from the Shipping Policy |
| `Kya aap crypto payment lete ho?` | Checks policy, says no, lists accepted methods |
| `Mujhe human se baat karni hai` | Calls `create_ticket` and shares the ticket ID |
| `ORD9999 ka status batao` | Tells you the order was not found, does not invent one |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Framer Motion, GSAP _(in progress)_ |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini API (`@google/genai`) with function calling |
| Search | MongoDB text index (custom BM25 coming soon) |

---

## 🔮 Roadmap

- [ ] Streaming replies with Server-Sent Events
- [ ] Animated chat UI with tool cards
- [ ] Scroll storytelling landing page
- [ ] Demo store page
- [ ] JWT authentication and rate limiting
- [ ] LRU cache for repeated questions
- [ ] Custom BM25 search, then vector search with embeddings
- [ ] Deploy and add the live demo link

---

## 👩‍💻 Author

Built by **Shama Parveen**

⭐ If you like this project, give it a star!