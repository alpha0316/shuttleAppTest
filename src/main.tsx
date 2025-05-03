// import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Screens/Home";
import BusStopDetails from './Screens/BusStopDetails'
import { ClosestStopProvider } from "./Screens/ClosestStopContext";


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <ClosestStopProvider>
    <Router>  {/* Wrapping your app with Router */}
      <Routes>  {/* Define Routes here */}
        <Route path="/" element={<Home />} />  
        <Route path="/BusStopDetails/:id" element={<BusStopDetails />} />  
      </Routes>
    </Router>

  </ClosestStopProvider>

);
