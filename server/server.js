import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ----------------------------------
   Check Gemini API Key
---------------------------------- */

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing in server/.env");
}

/* ----------------------------------
   Gemini Configuration
---------------------------------- */

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
});

/* ----------------------------------
   Helper Function
   Clean Gemini JSON Response
---------------------------------- */

function cleanJson(responseText) {
  let cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find the first { and last }
  // This protects against extra text around JSON.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned;
}

/* ----------------------------------
   POST /api/analyze
   Analyze user's trading question
---------------------------------- */

app.post("/api/analyze", async (req, res) => {
  try {
    const { question } = req.body;

    /* Validate question */

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    /* Gemini Prompt */

    const prompt = `
You are an AI trading research assistant.

Your job is NOT to give trading advice.

Your job is to convert a user's natural-language
trading research question into a structured experiment.

You must distinguish between:

1. Information explicitly provided by the user
2. Reasonable interpretations
3. Important information that is missing

Do NOT invent important trading parameters such as:

- holding period
- exit condition
- historical test period
- transaction costs
- slippage
- exact instrument

If important information is missing,
identify it clearly and ask clarification questions.

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add explanations outside the JSON.

Return JSON in exactly this structure:

{
  "question": "string",

  "instrument": {
    "value": "string or null",
    "provided": true
  },

  "timeframe": {
    "value": "string or null",
    "provided": true
  },

  "entryCondition": {
    "value": "string or null",
    "provided": true
  },

  "exitCondition": {
    "value": "string or null",
    "provided": true
  },

  "holdingPeriod": {
    "value": "string or null",
    "provided": true
  },

  "volatilityFilter": {
    "value": "string or null",
    "provided": true
  },

  "backtestPeriod": {
    "value": "string or null",
    "provided": true
  },

  "transactionCosts": {
    "value": "string or null",
    "provided": true
  },

  "filters": [],

  "objective": "string",

  "missingInformation": [],

  "clarificationQuestions": [],

  "assumptions": []
}

IMPORTANT RULES:

- "provided" must be false when the user did not explicitly provide that information.

- Never mark a field as provided=true if the user did not provide it.

- Do not invent a holding period.

- Do not invent an exit condition.

- Do not invent a historical test period.

- Do not invent transaction costs.

- Do not invent slippage.

- Do not invent an exact instrument when the user has not specified one.

- missingInformation should contain only information important enough to clarify before testing.

- clarificationQuestions should be concise and easy for the user to answer.

- assumptions should contain only relatively safe interpretations.

- Do not claim that the strategy works or does not work.

- No backtest has been performed.

PARAMETER HANDLING:

- Put the volatility definition or threshold in volatilityFilter.

- Put the historical test period in backtestPeriod.

- Put transaction costs and slippage assumptions in transactionCosts.

- Do NOT put backtestPeriod inside filters.

- Do NOT put transactionCosts inside filters.

- Use filters only for additional market conditions or strategy filters.

- If the user explicitly mentions something, preserve it.

User question:

"${question}"
`;

    /* Call Gemini */

    const result = await model.generateContent(prompt);

    const responseText = result.response.text();

    console.log("Gemini analyze response:");
    console.log(responseText);

    /* Clean response */

    const cleanedResponse = cleanJson(responseText);

    /* Convert JSON string to JavaScript object */

    const analysis = JSON.parse(cleanedResponse);

    /* Send result to frontend */

    res.json(analysis);

  } catch (error) {
    console.error("Gemini analyze error:", error);

    res.status(500).json({
      error: "Failed to analyze the trading question",
    });
  }
});

/* ----------------------------------
   POST /api/refine
   Build final experiment
---------------------------------- */

app.post("/api/refine", async (req, res) => {
  try {
    const {
      originalQuestion,
      initialAnalysis,
      clarificationAnswers,
    } = req.body;

    /* Validate required data */

    if (!originalQuestion) {
      return res.status(400).json({
        error: "Original question is required",
      });
    }

    if (!initialAnalysis) {
      return res.status(400).json({
        error: "Initial analysis is required",
      });
    }

    /* Gemini Prompt */

    const prompt = `
You are an AI trading research assistant.

The user originally asked:

"${originalQuestion}"

Here is the initial analysis:

${JSON.stringify(initialAnalysis, null, 2)}

The user has now provided clarification answers:

${JSON.stringify(clarificationAnswers, null, 2)}

Your job is to update the research experiment
using the user's clarification answers.

IMPORTANT:

- Prefer explicit user answers over assumptions.

- Never invent missing critical parameters.

- If a critical parameter is still missing,
  keep it missing.

- Do not claim that the strategy works or does not work.

- No backtest has been performed.

- Return ONLY valid JSON.

- Do not use Markdown.

- Do not use code fences.

- Do not add explanations outside the JSON.

IMPORTANT PARAMETER HANDLING:

- Preserve all information from the initial analysis
  unless the user's clarification changes it.

- Never discard information from the initial analysis
  without a reason.

- If the user provides a volatility threshold,
  put it in volatilityFilter.

- If the user provides a historical date range,
  put it in backtestPeriod.

- If the user provides transaction costs,
  put them in transactionCosts.

- If the user provides slippage,
  put it in transactionCosts.

- Do NOT put backtestPeriod inside filters.

- Do NOT put transactionCosts inside filters.

- Keep filters for additional strategy or
  market-condition filters only.

- Never discard an explicit clarification answer.

- Every explicit clarification answer must be
  reflected in the appropriate structured field.

- "provided" must be true when the user explicitly
  provides that information.

- "provided" must be false when the information
  has not been explicitly provided.

- Do not convert assumptions into user-provided facts.

Return exactly this JSON structure:

{
  "question": "string",

  "instrument": {
    "value": "string or null",
    "provided": true
  },

  "timeframe": {
    "value": "string or null",
    "provided": true
  },

  "entryCondition": {
    "value": "string or null",
    "provided": true
  },

  "exitCondition": {
    "value": "string or null",
    "provided": true
  },

  "holdingPeriod": {
    "value": "string or null",
    "provided": true
  },

  "volatilityFilter": {
    "value": "string or null",
    "provided": true
  },

  "backtestPeriod": {
    "value": "string or null",
    "provided": true
  },

  "transactionCosts": {
    "value": "string or null",
    "provided": true
  },

  "filters": [],

  "objective": "string",

  "missingInformation": [],

  "clarificationQuestions": [],

  "assumptions": []
}
`;

    /* Call Gemini */

    const result = await model.generateContent(prompt);

    const responseText = result.response.text();

    console.log("Gemini refine response:");
    console.log(responseText);

    /* Clean Gemini response */

    const cleanedResponse = cleanJson(responseText);

    /* Convert JSON to object */

    const analysis = JSON.parse(cleanedResponse);

    /* Send final experiment */

    res.json(analysis);

  } catch (error) {
    console.error("Gemini refine error:", error);

    res.status(500).json({
      error: "Failed to build the experiment",
    });
  }
});

/* ----------------------------------
   Health Check
---------------------------------- */

app.get("/", (req, res) => {
  res.json({
    message: "AI Trading Research Assistant API is running",
  });
});

/* ----------------------------------
   Start Server
---------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});