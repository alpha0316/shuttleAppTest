// import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Screens/Home";
import BusStopDetails from './Screens/BusStopDetails'
import TrackOrder from './Screens/TrackOrder'
import { ClosestStopProvider } from "./Screens/ClosestStopContext";
import { ClosestBusProvider  } from './Screens/useClosestBus';
// import { createBrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(

  <ClosestBusProvider >
  <ClosestStopProvider>
    <Router>  
      <Routes>  
        <Route path="/" element={<Home />} />  
        <Route path="/BusStopDetails/:id" element={<BusStopDetails />} />  
         <Route path="/TrackOrder" element={<TrackOrder />} />  
      </Routes>
    </Router>

  </ClosestStopProvider>
  </ClosestBusProvider >



);
