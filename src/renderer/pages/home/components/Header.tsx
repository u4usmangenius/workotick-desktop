import { Button, message } from "antd";
import React, { useState } from "react";
import { Post } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
interface IPCRenderer {
  captureScreenshot: () => void;
  clockIn: () => void;
  clockOut: () => void;
}

// Extend the Window interface to include the 'ipc' object
declare global {
  interface Window {
    ipc: IPCRenderer;
  }
}

const Header = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (navigator.onLine) {
      setLoading(true);

      try {
        await Post("logout", null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("clockIn");
        localStorage.removeItem("organization");
        window.ipc.clockOut();
        setLoading(false);
        message.success("Logout Successfully");
        navigate("/");
      } catch (error) {
        console.error("Logout Error:", error);
        setLoading(false);
        message.error("Failed to logout. Please try again later.");
      }
    } else {
      message.error("No internet connection");
    }
  };

  return (
    <div className='w-full flex justify-end'>
      <Button
        type={"link"}
        loading={loading}
        className='py-3'
        onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Header;
