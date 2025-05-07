// import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Screens/Home";
import BusStopDetails from './Screens/BusStopDetails'
import { ClosestStopProvider } from "./Screens/ClosestStopContext";
import { ClosestBusProvider  } from './Screens/useClosestBus';
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path : "/",
    element : Home()
  },
  {
    path : '/Home',
    element : Home()
  }
])

export {router}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(

  <ClosestBusProvider >
  <ClosestStopProvider>
    <Router>  
      <Routes>  
        <Route path="/" element={<Home />} />  
        <Route path="/BusStopDetails/:id" element={<BusStopDetails />} />  
      </Routes>
    </Router>

  </ClosestStopProvider>
  </ClosestBusProvider >



);
