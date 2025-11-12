// import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Screens/Home";
import BusStopDetails from './Screens/BusStopDetails'
import Tracker from './Screens/Tracker'
import { ClosestStopProvider } from "./Screens/ClosestStopContext";
import { ClosestBusProvider } from './Screens/useClosestBus';
import Auth from "./Screens/Auth";
import OTP from "./Screens/OTP";


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(

  <ClosestBusProvider >
    <ClosestStopProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/OTP" element={<OTP />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/BusStopDetails/:id" element={<BusStopDetails />} />
          <Route path="/Tracker" element={<Tracker />} />
        </Routes>
      </Router>

    </ClosestStopProvider>
  </ClosestBusProvider >



);
