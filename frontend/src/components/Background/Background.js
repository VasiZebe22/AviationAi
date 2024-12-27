import React from 'react';
import './Background.css';

const Background = () => {
  return (
    <div className="background-container">
      <img 
        src={process.env.PUBLIC_URL + '/images/space.png'} 
        alt="space background" 
        className="background-image"
        loading="lazy"
        aria-hidden="true"
      />
    </div>
  );
};

export default Background;
