import React from "react";

const GameProgressBar = ({ progress, progressPercentage, currentMode }) => {
  const roundedProgressPercentage = Math.round(progressPercentage);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm text-gray-600">
          {roundedProgressPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            currentMode === "error" ? "bg-orange-500" : "bg-blue-600"
          }`}
          style={{
            width: `${progressPercentage}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default GameProgressBar;
