# AI Trading Research Assistant

An AI-powered research assistant that converts natural-language trading questions into structured, testable experiments.

The project demonstrates the research workflow:

**Question → Hypothesis → Experiment → Evidence → Learning**

## 🌐 Links

**Live Demo:** https://ai-trading-research-assistant.vercel.app/



**Backend API:** https://ai-trading-research-assistant.onrender.com/

---

## 📌 Overview

Trading research questions are often expressed in natural language and may contain important missing or ambiguous information.

For example:

> "Does buying NIFTY after a 1.5% daily decline and holding for 3 trading days perform better when VIX is above 20?"

Before this question can be tested, several details may need to be clarified:

* What instrument should represent NIFTY?
* What historical period should be tested?
* How should the daily decline be calculated?
* What transaction costs should be assumed?
* What metrics define "better performance"?

Instead of silently making assumptions, this application uses AI to identify missing information and ask targeted clarification questions.

---

## 🎯 Project Goal

The goal is to build a small functional part of an AI Trading Research Assistant that can:

1. Understand a natural-language trading question
2. Identify important parameters
3. Detect missing information
4. Ask clarification questions
5. Convert the answers into a structured experiment
6. Run a prototype test
7. Present the results and reasonable interpretation
8. Suggest the next investigation

---

## ✨ Features

### 1. Natural Language Question

Users can enter a trading research question in plain English.

Example:

> Does buying NIFTY 50 after a 1.5% close-to-close decline and holding for 3 trading days perform better when India VIX is above 20 compared with when it is below 20?

---

### 2. AI-Powered Question Understanding

Google Gemini analyzes the question and extracts structured information including:

* Instrument
* Timeframe
* Entry condition
* Exit condition
* Holding period
* Volatility filter
* Backtest period
* Transaction costs
* Additional filters
* Objective

---

### 3. Ambiguity Detection

The application does not blindly assume important missing parameters.

Instead, it asks targeted clarification questions such as:

* What historical period should be used?
* What transaction costs and slippage should be assumed?
* What performance metric should be used?
* How should the entry condition be defined?

This makes the resulting experiment more explicit and reproducible.

---

### 4. Experiment Refinement

After the user answers the clarification questions, the answers are sent back to Gemini together with the original question and initial analysis.

The AI produces a final structured experiment.

Example:

```text
Instrument:
NIFTY 50 spot index

Timeframe:
Daily

Entry:
Buy when NIFTY's current day's close has declined
at least 1.5% from the previous day's close.

Exit:
Exit at the close of the third trading day after entry.

Holding Period:
3 trading days

Volatility Filter:
VIX > 20

Backtest Period:
January 2020 to December 2025

Transaction Costs:
0.1% total transaction costs and slippage
per round trip
```

---

### 5. Prototype Testing

The TEST stage runs the finalized experiment using simulated data.

The application clearly labels these results as **prototype/simulated results** rather than real historical market results.

A production-grade backtesting engine is outside the scope of this prototype.

---

### 6. Learning and Interpretation

The LEARN stage presents:

* Average return
* Number of simulated trades
* High-volatility results
* Normal-volatility results
* Difference between groups
* What the simulated data shows
* What can reasonably be concluded
* Limitations
* Suggested next investigations

The application intentionally separates the observed result from the interpretation.

---

## 🧠 Example Workflow

### Step 1 — Question

```text
Does buying NIFTY 50 after a 1.5% close-to-close decline
and holding for 3 trading days perform better when
India VIX is above 20 compared with when it is below 20?
```

### Step 2 — Initial Understanding

The AI extracts:

```text
Instrument: NIFTY 50
Timeframe: Daily
Entry: 1.5% close-to-close decline
Holding period: 3 trading days
Volatility condition: India VIX > 20
```

### Step 3 — Clarification

The AI identifies information that needs to be specified, such as:

```text
- Backtest period
- Transaction costs
- Performance metrics
- Exact entry/exit definition
```

### Step 4 — Final Experiment

The user's answers are combined with the original analysis to create a structured experiment.

### Step 5 — Test

The experiment is tested using simulated prototype data.

### Step 6 — Learn

The application presents the simulated outcome, limitations, and possible next investigations.

---

## 🏗️ Architecture

```text
                    User
                      │
                      ▼
            ┌──────────────────┐
            │   React + Vite   │
            │    Frontend      │
            └────────┬─────────┘
                     │
                     │ HTTP API
                     ▼
            ┌──────────────────┐
            │ Express / Node.js│
            │     Backend      │
            └────────┬─────────┘
                     │
                     │ Gemini API
                     ▼
            ┌──────────────────┐
            │   Google Gemini  │
            │      Model       │
            └──────────────────┘
```

### Deployment

```text
Vercel
  │
  │ Frontend
  ▼
React Application
  │
  │ API Requests
  ▼
Render
  │
  │ Express Backend
  ▼
Google Gemini API
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI

* Google Gemini API
* `@google/generative-ai`

### Deployment

* Vercel — frontend
* Render — backend
* GitHub — source control

---

## 📂 Project Structure

```text
ai-trading-research-assistant/
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── package.json
├── .gitignore
└── README.md
```

---

## 🔌 Backend API

### `GET /`

Health-check endpoint.

Example response:

```json
{
  "message": "AI Trading Research Assistant API is running"
}
```

---

### `POST /api/analyze`

Analyzes the user's natural-language trading question.

Example request:

```json
{
  "question": "Does buying NIFTY after a 1.5% daily decline and holding for 3 trading days perform better when VIX is above 20?"
}
```

The response contains structured experiment fields and clarification questions.

---

### `POST /api/refine`

Refines the initial experiment using the user's clarification answers.

Example request:

```json
{
  "originalQuestion": "...",
  "initialAnalysis": {},
  "clarificationAnswers": []
}
```

---

## 🔐 Environment Variables

### Backend

Create:

```text
server/.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Frontend

For local development, create:

```text
.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

For the deployed frontend, the environment variable points to:

```text
VITE_API_URL=https://ai-trading-research-assistant.onrender.com
```

### Security

API keys are kept on the backend and are not exposed in the React frontend.

The following files should never be committed:

```text
.env
server/.env
node_modules/
dist/
```

---

## ▶️ Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Swaraj234/ai-trading-research-assistant.git
```

### 2. Enter the project

```bash
cd ai-trading-research-assistant
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Install backend dependencies

```bash
cd server
npm install
```

### 5. Configure Gemini

Create:

```text
server/.env
```

and add:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 6. Start the backend

```bash
cd server
npm start
```

Backend:

```text
http://localhost:5000
```

### 7. Start the frontend

Open another terminal:

```bash
cd ai-trading-research-assistant
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🤖 AI Implementation

Gemini is used as a structured reasoning layer rather than simply as a chatbot.

### Question Analysis

The AI:

* extracts trading parameters
* identifies missing critical information
* generates clarification questions
* identifies safe assumptions

### Experiment Refinement

The AI receives:

* original user question
* initial analysis
* clarification questions
* user's answers

It then creates the final structured experiment.

### Prompt Design Principles

The prompts instruct the model to:

* Avoid inventing critical parameters
* Ask clarification questions when important information is missing
* Preserve explicitly provided information
* Distinguish volatility filters from general filters
* Keep backtest periods separate from strategy filters
* Keep transaction costs separate from strategy filters
* Avoid claiming that a strategy has a real trading edge

---

## 💡 Key Product Decisions

### Ask Instead of Assume

A key design decision was to ask the user for important missing information instead of silently guessing.

This improves transparency and makes experiments more reproducible.

### Structured Output

The AI response follows a predictable JSON structure.

This makes the experiment easier to display in the UI and allows the structured experiment to be passed to a future backtesting system.

### Separate Evidence From Interpretation

The LEARN stage separates:

**What the data shows**

from

**What we can reasonably conclude**

This helps avoid presenting an AI interpretation as if it were raw evidence.

### Prototype Before Production

The project focuses on demonstrating the AI-driven research workflow rather than spending the entire prototype scope on building a production-grade trading infrastructure.

---

## ⚠️ Prototype Data Limitation

The TEST stage currently uses simulated data.

Therefore, the displayed performance numbers are **illustrative only**.

They should not be interpreted as evidence that the strategy works in real markets.

A production version would connect the structured experiment to:

* Historical NIFTY data
* India VIX data
* Transaction costs
* Slippage
* A proper backtesting engine

---

## 🚀 Future Improvements

### Real Historical Data

Connect the application to reliable historical market and volatility data.

### Backtesting Engine

Pass the structured experiment directly into a backtesting engine.

### More Performance Metrics

Add:

* Win rate
* Maximum drawdown
* Sharpe ratio
* Profit factor
* Equity curve
* Trade distribution

### Experiment History

Allow users to save and revisit previous research experiments.

### Strategy Comparison

Allow multiple experiments to be compared side-by-side.

### Visualization

Add charts for:

* Returns
* Drawdowns
* Performance over time
* High VIX vs normal VIX
* Trade distributions

---

## 🎓 What I Learned

This project helped me understand how to build an AI-assisted application where an LLM is part of a structured product workflow rather than simply being used as a conversational interface.

Key areas I learned and practiced:

* Designing AI prompts for structured output
* Handling ambiguity in natural-language requests
* Building a React frontend
* Building an Express backend
* Integrating the Gemini API
* Keeping API credentials secure
* Designing an AI-to-application JSON contract
* Deploying a frontend and backend separately
* Thinking about evidence versus AI interpretation

---


