import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function displayValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.value || JSON.stringify(value);
  return value;
}

function ExperimentItem({ label, value }) {
  return (
    <div className="experiment-item">
      <span>{label}</span>
      <strong>{displayValue(value) || "Not specified"}</strong>
    </div>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // --- Step 01: analyze the raw question ---
  const analyzeQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnalysis(null);
    setAnswers({});
    setTestResult(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (index, value) => {
    setAnswers((previous) => ({ ...previous, [index]: value }));
  };

  // --- Step 02: refine into a concrete experiment ---
  const buildExperiment = async () => {
    setLoading(true);
    setError("");
    setTestResult(null);

    try {
      const clarificationAnswers = analysis.clarificationQuestions.map(
        (clarificationQuestion, index) => ({
          question: clarificationQuestion,
          answer: answers[index] || "",
        })
      );

      const response = await fetch(`${API_URL}/api/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalQuestion: question,
          initialAnalysis: analysis,
          clarificationAnswers,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to build experiment");

      setAnalysis(data);
      setAnswers({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 04: run the experiment (simulated data for now) ---
  const runExperiment = () => {
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      const highVolatilityTrades = 61;
      const normalVolatilityTrades = 63;
      const highVolatilityReturn = 3.1;
      const normalVolatilityReturn = 1.2;
      const difference = highVolatilityReturn - normalVolatilityReturn;

      setTestResult({
        dataType: "Simulated prototype data",
        instrument: analysis.instrument?.value || "Not specified",
        timeframe: analysis.timeframe?.value || "Not specified",
        entryCondition: analysis.entryCondition?.value || "Not specified",
        holdingPeriod: analysis.holdingPeriod?.value || "Not specified",
        volatilityFilter: analysis.volatilityFilter?.value || "Not specified",
        backtestPeriod: analysis.backtestPeriod?.value || "Not specified",
        transactionCosts: analysis.transactionCosts?.value || "Not specified",
        trades: highVolatilityTrades + normalVolatilityTrades,
        highVolatilityTrades,
        normalVolatilityTrades,
        highVolatilityReturn,
        normalVolatilityReturn,
        difference: Number(difference.toFixed(2)),
        conclusion:
          highVolatilityReturn > normalVolatilityReturn
            ? "In this simulated sample, the strategy produced a higher average return during high-volatility periods."
            : "In this simulated sample, the strategy did not produce a higher average return during high-volatility periods.",
        limitation:
          "This result is illustrative only. It is not evidence that the strategy has a real market edge.",
      });

      setTesting(false);
    }, 1200);
  };

  const hasQuestions = analysis?.clarificationQuestions?.length > 0;

  return (
    <div className="app">
      <header className="header">
        <p className="kicker">Research notebook</p>
        <h1>AI Trading Research Assistant</h1>
        <p className="subtitle">
          Turn a market question into a structured research experiment.
        </p>
      </header>

      <main className="container">
        {/* Ask */}
        <section className="question-card">
          <label htmlFor="question">What do you want to investigate?</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Does buying NIFTY after a 1% fall work better during high-volatility periods?"
            rows={5}
          />
          <button onClick={analyzeQuestion} disabled={loading || !question.trim()}>
            {loading ? "Analyzing..." : "Analyze question"}
          </button>
        </section>

        {error && <div className="error">{error}</div>}

        {analysis && (
          <>
            {/* Step 01 */}
            <section className="card">
              <div className="section-header">
                <span className="step">01</span>
                <h2>Initial understanding</h2>
              </div>

              <div className="experiment-grid">
                <ExperimentItem label="Instrument" value={analysis.instrument?.value} />
                <ExperimentItem label="Timeframe" value={analysis.timeframe?.value} />
                <ExperimentItem label="Entry condition" value={analysis.entryCondition?.value} />
                <ExperimentItem label="Exit condition" value={analysis.exitCondition?.value} />
                <ExperimentItem label="Holding period" value={analysis.holdingPeriod?.value} />
                <ExperimentItem label="Objective" value={analysis.objective} />
              </div>

              {analysis.filters?.length > 0 && (
                <div className="subsection">
                  <h3>Filters</h3>
                  <ul>
                    {analysis.filters.map((filter, index) => (
                      <li key={index}>{displayValue(filter)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Step 02 */}
            {hasQuestions && (
              <section className="card">
                <div className="section-header">
                  <span className="step">02</span>
                  <h2>Clarify your experiment</h2>
                </div>
                <p className="section-note">Some important details are missing.</p>

                <div className="clarification-list">
                  {analysis.clarificationQuestions.map((clarificationQuestion, index) => (
                    <div className="clarification-item" key={index}>
                      <label>{clarificationQuestion}</label>
                      <input
                        type="text"
                        value={answers[index] || ""}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        placeholder="Enter your answer..."
                      />
                    </div>
                  ))}
                </div>

                <button onClick={buildExperiment} disabled={loading}>
                  {loading ? "Building experiment..." : "Build experiment"}
                </button>
              </section>
            )}

            {/* Missing information */}
            {analysis.missingInformation?.length > 0 && (
              <section className="card subtle">
                <h3>Why clarification is needed</h3>
                <ul>
                  {analysis.missingInformation.map((item, index) => (
                    <li key={index}>{displayValue(item)}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Assumptions */}
            {analysis.assumptions?.length > 0 && (
              <section className="card subtle">
                <h3>AI assumptions</h3>
                <ul>
                  {analysis.assumptions.map((item, index) => (
                    <li key={index}>{displayValue(item)}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Step 03 */}
            {!hasQuestions && (
              <section className="card">
                <div className="section-header">
                  <span className="step">03</span>
                  <h2>Final experiment</h2>
                  <span className="badge badge-ready">Ready to test</span>
                </div>

                <div className="experiment-grid">
                  <ExperimentItem label="Instrument" value={analysis.instrument?.value} />
                  <ExperimentItem label="Timeframe" value={analysis.timeframe?.value} />
                  <ExperimentItem label="Entry condition" value={analysis.entryCondition?.value} />
                  <ExperimentItem label="Exit condition" value={analysis.exitCondition?.value} />
                  <ExperimentItem label="Holding period" value={analysis.holdingPeriod?.value} />
                  <ExperimentItem label="Objective" value={analysis.objective} />
                  <ExperimentItem label="Volatility filter" value={analysis.volatilityFilter?.value} />
                  <ExperimentItem label="Backtest period" value={analysis.backtestPeriod?.value} />
                  <ExperimentItem label="Transaction costs" value={analysis.transactionCosts?.value} />
                </div>

                <div className="hypothesis">
                  <span>Research question</span>
                  <p>{analysis.question}</p>
                </div>
              </section>
            )}

            {/* Step 04 */}
            {!hasQuestions && (
              <section className="card">
                <div className="section-header">
                  <span className="step">04</span>
                  <h2>Test</h2>
                  <span className="badge badge-prototype">Prototype</span>
                </div>

                <p className="section-note">
                  Run this experiment using simulated data to demonstrate how the
                  research workflow could work.
                </p>

                <div className="test-experiment">
                  <h3>Experiment being tested</h3>
                  <div className="test-experiment-grid">
                    <div>
                      <span>Instrument</span>
                      <strong>{displayValue(analysis.instrument?.value)}</strong>
                    </div>
                    <div>
                      <span>Timeframe</span>
                      <strong>{displayValue(analysis.timeframe?.value)}</strong>
                    </div>
                    <div>
                      <span>Entry</span>
                      <strong>{displayValue(analysis.entryCondition?.value)}</strong>
                    </div>
                    <div>
                      <span>Holding period</span>
                      <strong>{displayValue(analysis.holdingPeriod?.value)}</strong>
                    </div>
                    <div>
                      <span>Volatility filter</span>
                      <strong>{displayValue(analysis.volatilityFilter?.value)}</strong>
                    </div>
                    <div>
                      <span>Backtest period</span>
                      <strong>{displayValue(analysis.backtestPeriod?.value)}</strong>
                    </div>
                  </div>
                </div>

                <button onClick={runExperiment} disabled={testing}>
                  {testing ? "Running experiment..." : "Run experiment"}
                </button>

                <div className="data-notice">
                  This prototype uses simulated data. The result below is not a
                  real historical backtest.
                </div>
              </section>
            )}

            {/* Step 05 */}
            {testResult && (
              <section className="card">
                <div className="section-header">
                  <span className="step">05</span>
                  <h2>Learn</h2>
                  <span className="badge badge-ready">Experiment complete</span>
                </div>

                <div className="result-summary">
                  <div className="result-number">
                    <span>High-volatility average return</span>
                    <strong>+{testResult.highVolatilityReturn}%</strong>
                  </div>
                  <div className="result-number">
                    <span>Normal-volatility average return</span>
                    <strong>+{testResult.normalVolatilityReturn}%</strong>
                  </div>
                  <div className="result-number">
                    <span>Difference</span>
                    <strong>+{testResult.difference}%</strong>
                  </div>
                </div>

                <div className="result-details">
                  <div>
                    <span>Total simulated trades</span>
                    <strong>{testResult.trades}</strong>
                  </div>
                  <div>
                    <span>High-volatility trades</span>
                    <strong>{testResult.highVolatilityTrades}</strong>
                  </div>
                  <div>
                    <span>Normal-volatility trades</span>
                    <strong>{testResult.normalVolatilityTrades}</strong>
                  </div>
                </div>

                <div className="learning-section">
                  <h3>What the data shows</h3>
                  <p>{testResult.conclusion}</p>
                </div>

                <div className="learning-section limitation">
                  <h3>What we can reasonably conclude</h3>
                  <p>{testResult.limitation}</p>
                </div>

                <div className="learning-section">
                  <h3>What should we investigate next?</h3>
                  <ul>
                    <li>Test the strategy on actual historical NIFTY data.</li>
                    <li>Compare multiple holding periods.</li>
                    <li>Include transaction costs and slippage.</li>
                    <li>Test whether the result remains consistent across different market periods.</li>
                  </ul>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;