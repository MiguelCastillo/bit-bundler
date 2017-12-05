import React from "react";
import ReactDOM from "react-dom";
import Hello from "./hello.jsx";
import World from "./world.jsx";

ReactDOM.render(
  <h1>
    <Hello></Hello>&nbsp;
    <World></World>!
  </h1>,
  document.getElementById("root")
);
