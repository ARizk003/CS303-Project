const TOP_RATED_THRESHOLD = 4.5;

const TopRatedBadge = ({ rating, style = {} }) => {
    const value = parseFloat(rating);
    if (!Number.isFinite(value) || value < TOP_RATED_THRESHOLD) return null;

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            backgroundColor: "#fff8e1",
            color: "#e67e00",
            border: "1.5px solid #f39c12",
            borderRadius: 50,
            padding: "2px 10px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            ...style,
        }}>
            ⭐ Top Rated
        </span>
    );
};

export default TopRatedBadge;