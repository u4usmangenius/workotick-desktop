import { Card, message, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { DashboardData } from "../../../types/Dashboard";
import { Get, Post } from "../../../utils/api";
import { getTimeZoneForOrganization } from "../../../utils/auth";
import { getDateTimeInTimezone } from "../../../utils/internationalization";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../../utils/seturl";
const { Title } = Typography;

const Progress = () => {
  const [data, setData] = useState<DashboardData>({
    active_time: "00:00",
    logged_time: 0,
    app_status: "",
    clock_in_at: "",
  });
  const navigate = useNavigate();
  const handleOpenLink = (url: string) => {
    event.preventDefault();
    window.ipc.openLinkPlease(url);
  };
  const organizationId = localStorage.getItem("organization");
  const baseUrl = BaseUrl("staging");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Get(`desktop/${organizationId}/dashboard`, null);
        setData(response.data);
        console.log(data.app_status);
        if (response.data.app_status === "Inactive") {
          try {
            await Post(`desktop/${organizationId}/clock-out`, null);
            localStorage.removeItem("organization");
            window.ipc.clockOut();
            window.ipc.showNotification(
              "In Active",
              "You have been in-active and workotick clock out you. Kindly clock-in again"
            );
            navigate("/home");
          } catch (error) {
            message.error("Something went wrong");
          }
        }
      } catch (error) {
        message.error("Something went wrong!");
      }
    };

    fetchData();

    // Call the API every minute
    const intervalId = setInterval(fetchData, 60000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [organizationId]);
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <Title level={4}>Your Progress</Title>
        <p className="text-sm">
          {getDateTimeInTimezone(getTimeZoneForOrganization())}
        </p>
        <button
          onClick={() => handleOpenLink(baseUrl.frontend)}
          className="text-blue-400"
        >
          <small>Visit Dashboard</small>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Card bordered={false} size={"small"}>
          <Statistic title="Active Time" value={data.active_time} />
        </Card>

        <Card bordered={false} size={"small"}>
          <Statistic title="Logged Time" value={data.logged_time} />
        </Card>

        <Card bordered={false} size={"small"}>
          <Statistic title="Current Status" value={data.app_status} />
        </Card>

        <Card bordered={false} size={"small"}>
          <Statistic title="Clock In Time" value={data.clock_in_at} />
        </Card>
      </div>
    </div>
  );
};

export default Progress;
