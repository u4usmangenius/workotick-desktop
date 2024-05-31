import { message } from "antd";
import { useEffect, useState } from "react";
import { Post } from "../../utils/api";
import Header from "./components/Header";
import { Screenshot } from "../../types/Screenshot";
import { IpcRendererEvent } from "electron";
import Progress from "./components/Progress";
import Memo from "./components/Memo";
import { useNavigate } from "react-router-dom";
import { getTimeIntervalForOrganization } from "../../utils/auth";
import ProjectReport from "./components/ProjectReport";
import moment from "moment";

const Dashboard = () => {
  const organizationId = localStorage.getItem("organization");
  const screenshotInterval = getTimeIntervalForOrganization() * 1000;
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.ipc.showMessage((event: IpcRendererEvent, data: string) => {
      message.error(data);
    });
  });

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      const online = navigator.onLine;
      if (online) {
        window.ipc.showNotification(
          "Internet Connection",
          "Internet connection restored, Kindly clock-in again"
        );
      } else {
        // Internet connection lost
        window.ipc.showNotification(
          "Internet Connection",
          "Your internet connection is disconnected. Due to internet disconnection workotick clock out you"
        );
        window.ipc.clockOut();
        window.ipc.internetDisconnect();
        navigate("/home");
      }
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      window.ipc.captureScreenshot();
    }, screenshotInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  });
  useEffect(() => {
    const intervalId = setInterval(() => {
      const IamOnline = async () => {
        try {
          await Post(`desktop/${organizationId}/im-online`, null);
        } catch (error) {
          console.log(error);
        }
      };

      IamOnline();
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await Post(
        `organization/${organizationId}/my-report/time-summary`,
        { date: moment().format("YYYY-MM-DD") }
      );
      setReportData(response.data.projects);
      setLoading(false);
    } catch (e) {
      message.error(e.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.ipc.getScreenshot((event: IpcRendererEvent, data: Screenshot) => {
      sendScreenshot(data);
    });
    const sendScreenshot = async (data: Screenshot) => {
      try {
        await Post(`desktop/${organizationId}/screenshot`, data);
        getData();
      } catch (error) {
        console.log(error);
      }
    };

    return () => {
      window.ipc.removeListener();
    };
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const clockOut = async () => {
    try {
      await Post(`desktop/${organizationId}/clock-out`, null);
      localStorage.removeItem("organization");
      window.ipc.clockOut();
      message.success("clock out Successfully");
      navigate("/");
    } catch (error) {
      console.error("clock out Error:", error);
      message.error("Failed to clock out. Please try again later.");
    }
  };

  useEffect(() => {
    window.ipc.clockedOut((event: IpcRendererEvent) => {
      clockOut();
      navigate("/home");
    });
  });

  return (
    <div className="bg-gray-100 min-h-screen overflow-hidden">
      <Header />
      <Progress />
      <Memo />
      <ProjectReport
        reportData={reportData}
        loading={loading}
        getData={getData}
      />
    </div>
  );
};

export default Dashboard;
