import { useEffect, useState } from "react";

function ReviewAnalysis({ filters }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
  state: filters.state,
  payment: filters.payment,
});

const response = await fetch(
  `http://localhost:5000/api/reviews?${params}`
);

        if (!response.ok) {
          throw new Error("Reviews API failed");
        }

        const data = await response.json();

        console.log("REVIEW DATA:", data);

        setReviews(data);
      } catch (error) {
        console.error("REVIEW ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [filters]);

  const totalReviews = reviews.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );

  const fiveStar =
    reviews.find((item) => item.score === 5)?.count || 0;

  const fiveStarPercentage = totalReviews
    ? ((fiveStar / totalReviews) * 100).toFixed(1)
    : 0;

  return (
    <div className="review-analysis">
      <div className="review-header">
        <div>
          <h2>Review Analysis</h2>
          <p>Customer review distribution</p>
        </div>
      </div>

      {loading ? (
        <p>Loading review data...</p>
      ) : reviews.length === 0 ? (
        <p>No review data available</p>
      ) : (
        <>
          <div className="review-summary">
            <strong>{fiveStarPercentage}%</strong>
            <span>5-Star Reviews</span>
          </div>

          <div className="review-list">
            {reviews.map((item) => {
              const percentage = totalReviews
                ? (item.count / totalReviews) * 100
                : 0;

              return (
                <div className="review-item" key={item.score}>
                  <div className="review-label">
                    <span>⭐ {item.score}</span>

                    <strong>
                      {Number(item.count).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="review-bar">
                    <div
                      className="review-bar-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewAnalysis;