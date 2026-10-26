<div align="center">

# 🤖 NOVA

### *Support that actually slaps.*

An AI customer support agent that tracks orders, answers from real policies, opens tickets and cancels orders safely. No hold music. No cap.

![React](https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/VITE-1a1a2e?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Three.js](https://img.shields.io/badge/THREE.JS-1a1a2e?style=for-the-badge&logo=threedotjs&logoColor=white)
![Framer Motion](https://img.shields.io/badge/FRAMER_MOTION-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/NODE.JS-1a1a2e?style=for-the-badge&logo=nodedotjs&logoColor=6CC24A)
![Express](https://img.shields.io/badge/EXPRESS-1a1a2e?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MONGODB-1a1a2e?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Gemini](https://img.shields.io/badge/GEMINI_API-1a1a2e?style=for-the-badge&logo=googlegemini&logoColor=8E75B2)

| 🔴 Live Demo | 🧠 Agent Tools | 📚 Policy Docs |
|:---:|:---:|:---:|
| **[Open the app](https://support-agent-rosy-seven.vercel.app)** | **4 tools**<br>_order, policy, ticket, cancel_ | **5 and counting**<br>_refund, return, shipping..._ |

</div>

> ⏳ The backend runs on a free Render instance. If nobody used it for a while, the first request can take 30 to 60 seconds while it wakes up.

---

## ✨ What is this?

**Nova** is an AI support agent for a fictional e-commerce store, wrapped in a full store website. A customer can write in English, Hindi or Hinglish, and Nova will:

- 📦 look up the **real order status** from the database,
- 📜 answer **policy questions** only from the store's own documents (no guessing),
- 🎫 **create a support ticket** when it cannot solve the problem or the customer asks for a human,
- 🛑 **cancel an order**, but only after the customer presses a confirm button.

Nova is not just a chatbot that talks. It **decides when to use a tool**, runs it, reads the result and then replies.

> Note: no model was trained here. Nova uses a pre-trained LLM (Gemini) through its API, and adds **tool calling**, **RAG** and **prompt engineering** on top.

---

## 🧠 How the agent works

```
Customer: "How long do refunds take?"
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

| Tool | What it does |
|---|---|
| `get_order_status` | Fetches status, items, ETA and whether the order can still be cancelled |
| `search_policy` | Keyword search over policy docs (RAG) |
| `create_ticket` | Creates a support ticket and returns a ticket ID |
| `cancel_order` | Starts a cancellation. It **never cancels by itself**, it shows a confirmation card |

### 🛡️ Safe cancellation (human in the loop)

1. Nova calls `cancel_order`. The server checks that the order exists and is still `Packed`.
2. The chat shows a **confirmation card** with *Keep order* and *Yes, cancel it*.
3. Only the customer's button press calls `POST /api/orders/cancel`. The model has no way to cancel on its own.
4. The button carries a **signed, short-lived token** (HMAC, expires in 5 minutes) that the model never sees.

---

## 🎬 Features

### Backend

- 🔌 REST API with Express, health check and CORS allow-list
- 💾 Conversation memory stored in MongoDB
- 🛠️ Tool calling with an agent loop (up to 5 steps per message)
- 📚 RAG with MongoDB text indexes, so answers come from real policies
- 🎯 Grounded answers: if a policy does not mention something, Nova says so instead of making it up
- 🔁 **Multi-model fallback**: a list of Gemini models is tried in order, and a model that hits quota or errors is skipped for a while
- ⏱️ Request timeouts, so a stuck call fails fast
- 🚦 Rate limiting (30 requests per minute per IP)
- 🛒 Demo checkout API that saves orders so Nova can track them
- 🌐 Replies in English by default, and in the customer's language if they switch

### Frontend

- 🌌 3D glass-orb background (Three.js) and a scroll-driven story
- 🧪 **Nova Lab**: watch the agent think, call a tool and answer, step by step
- 🪐 360° orbit navigation you can drag
- 🛍️ Store with tilt cards, wishlist, colour swatches, fly-to-cart animation, cart drawer and checkout
- 💬 Chat widget with a mascot, live tool hints, order timeline card, ticket card and cancel confirmation card
- 🟢 Live "Nova online/offline" status in the navbar, chat and footer
- 😄 A ticklish mascot: tap it up to 4 times and see how its mood changes

---

## 📁 Project Structure

```
support-agent/
├── backend/
│   ├── src/
│   │   ├── config/db.js               # MongoDB connection
│   │   ├── models/                    # Conversation, Order, Ticket, KnowledgeDoc
│   │   ├── routes/                    # chat.routes.js, order.routes.js
│   │   ├── controllers/chat.controller.js
│   │   ├── services/
│   │   │   ├── llm.service.js         # Gemini calls, agent loop, model fallback
│   │   │   ├── tools.js               # tool definitions and logic
│   │   │   └── cancelToken.js         # signed cancel-confirmation tokens
│   │   ├── seed.js                    # dummy orders
│   │   ├── seedDocs.js                # policy documents
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                    # sections: hero, story, lab, store, orbit
    │   ├── components/                # Chat, Drawer, Scene3D, Timeline
    │   ├── data.js
    │   └── index.css
    └── package.json
```

---

## 🧭 API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` and `/health` | Server health check |
| `POST` | `/api/chat` | Send a message, get Nova's reply (and optional UI actions) |
| `POST` | `/api/orders` | Place a demo order |
| `POST` | `/api/orders/cancel` | Cancel an order using a signed token from the confirmation card |

---

## 🚀 Run it locally

**1. Clone**

```bash
git clone https://github.com/shama21parveen/support-agent.git
cd support-agent
```

**2. Backend**

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODELS=gemini-3-flash-preview,gemini-flash-lite-latest,gemini-3.1-flash-lite,gemini-3.5-flash
GEMINI_TIMEOUT_MS=20000
CANCEL_SECRET=any_long_random_text
```

Add sample data and start:

```bash
node src/seed.js        # 4 dummy orders
node src/seedDocs.js    # 5 policy documents
npm run dev
```

**3. Frontend** (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. To point the frontend at another backend, create `frontend/.env` with `VITE_API_URL=https://your-backend-url`.

Sample order IDs: `ORD1001`, `ORD1002`, `ORD1003`, `ORD1004`.

---

## 🧪 Things to try

| Say this | What Nova does |
|---|---|
| `Where's my order ORD1001?` | Calls `get_order_status` and shows a timeline |
| `How long do refunds take?` | Calls `search_policy`, answers from the Refund Policy |
| `Do you accept crypto?` | Checks policy, says no, lists accepted methods |
| `Cancel order ORD1003` | Shows a confirmation card, cancels only after you press the button |
| `Cancel order ORD1001` | Explains it is already shipped and cannot be cancelled |
| `My order arrived damaged, I want a human` | Calls `create_ticket` and shares the ticket ID |
| `Mera order ORD1002 kahan hai?` | Replies in Hinglish |

---

## ☁️ Deployment

| Part | Platform |
|---|---|
| Frontend | Vercel (root directory `frontend`, env `VITE_API_URL`) |
| Backend | Render (root directory `backend`, env vars above plus `FRONTEND_URL`) |
| Database | MongoDB Atlas |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Framer Motion, Three.js |
| Backend | Node.js, Express, express-rate-limit |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini API (`@google/genai`) with function calling |
| Search | MongoDB text index |

---

## ⚠️ Known limitations

- **No login yet.** Anyone who knows an order ID could start a cancellation. A real system would tie orders to a logged-in user.
- Checkout is a **demo**: no real payment is taken.
- Tickets are saved in the database, but there is **no admin panel** yet, and Nova cannot look up a ticket's status.
- The free Gemini tier has small daily quotas, so Nova can run out of free messages for the day.

---

## 🔮 Roadmap

- [ ] Streaming replies
- [ ] JWT login and order ownership checks
- [ ] `get_ticket_status` tool and a small admin dashboard
- [ ] Source citations in answers
- [ ] Agent evals (test script that checks the right tool is used)
- [ ] Custom BM25 search, then vector search with embeddings
- [ ] FAQ caching to save API calls

---

## 👩‍💻 Author

Built by **Shama Parveen**

📧 [shama21parveen@gmail.com](mailto:shama21parveen@gmail.com) · 🐙 [GitHub](https://github.com/shama21parveen) · 💼 [LinkedIn](https://www.linkedin.com/in/shama-parveen-956258229)

⭐ If you like this project, give it a star!