import { Routes, Route, HashRouter } from "react-router-dom";
import Login from "./pages/auth/Login";
import "../index.css";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route
            path='/'
            element={<Login />}
          />
          <Route
            path='/home'
            element={<Home />}
          />
          <Route
            path='/dashboard'
            element={<Dashboard />}
          />
        </Routes>
      </HashRouter>
    </>
  );
}
