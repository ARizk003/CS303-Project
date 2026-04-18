import React, { useState } from 'react';

const StarRating = ({ initialRating = 0, onRate, readonly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="d-flex gap-1 justify-content-center align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{
                        cursor: readonly ? 'default' : 'pointer',
                        fontSize: '1.4rem',
                        color: star <= (hover || initialRating) ? '#f39c12' : '#dee2e6',
                        transition: 'color 0.2s',
                        userSelect: 'none'
                    }}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    onClick={() => !readonly && onRate && onRate(star)}
                >
          ★
        </span>
            ))}
        </div>
    );
};

export default StarRating;