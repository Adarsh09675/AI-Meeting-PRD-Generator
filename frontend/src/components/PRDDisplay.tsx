import React from 'react';

interface PRDDisplayProps {
  content: string;
}

const PRDDisplay: React.FC<PRDDisplayProps> = ({ content }) => {
  return (
    <div>
      <h2>Product Requirements Document</h2>
      <pre>{content}</pre>
    </div>
  );
};

export default PRDDisplay;