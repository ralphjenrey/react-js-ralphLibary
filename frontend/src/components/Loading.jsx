// Loading.jsx

import React from "react";
import { BeatLoader } from "react-spinners";

const Loading = ({ state, size }) => {
  return (
    <div className="loader-container">
      <BeatLoader color="#19a4d2" size={size} loading={state} />
      <style jsx="true">{`
  .loader-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`}</style>
    </div>
  );
};

export default Loading;
