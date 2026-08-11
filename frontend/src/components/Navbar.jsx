import { useState } from "react";

function Navbar() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askMetricMind = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const response = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();

      setAnswer(data.answer);
    } catch (error) {
      console.error("Ask MetricMind Error:", error);
      setAnswer("Unable to get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      askMetricMind();
    }
  };

  return (
    <>
      <div className="navbar">
        <h2>Agentic BI Dashboard</h2>

        <div className="ask-container">
          <input
            type="text"
            placeholder="Ask MetricMind..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={askMetricMind}>
            Ask
          </button>
        </div>
      </div>

      {answer && (
        <div className="ask-answer">
          <strong>🤖 MetricMind</strong>
          <p>{loading ? "Analyzing..." : answer}</p>
        </div>
      )}
    </>
  );
}

export default Navbar;