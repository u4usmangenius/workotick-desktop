import {
  Avatar,
  Button,
  Divider,
  Form,
  Select,
  Space,
  Spin,
  message,
} from "antd";
import {
  ReloadOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Footer from "../../Layout/footer";
import { Get, Post } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo-desktop.png";
import { getUserFromLocalStorage } from "../../utils/auth";
import { Organization } from "../../types/organization";
import { greetings } from "../../utils/greetings";
import Header from "./components/Header";
import { BaseUrl } from "../../utils/seturl";

const Home = () => {
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();
  const { name } = user;
  const [btnLoading, setBtnLoading] = useState(false);
  const [timezone, setTimezone] = useState(null);
  const [organizations, setOrganizations] = useState(user.organizations);
  const [loading, setloading] = useState(false);
  const baseUrl = BaseUrl("staging");

  const fetchData = async () => {
    if (navigator.onLine) {
      setloading(true);
      try {
        const response = await Get(`/organization`, null);
        setOrganizations(response.data);
        setloading(false);
      } catch (error) {
        message.error("Cannot fetch organizations, try again!");
        setloading(false);
      }
    } else {
      message.error("No internet connection");
    }
  };

  const onFinish = async ({ organizationId }: { organizationId: number }) => {
    if (navigator.onLine) {
      setBtnLoading(true);
      try {
        await Post(`desktop/${organizationId}/clock-in`, null);
        localStorage.setItem("organization", organizationId.toString());
        setTimezone(
          user.organizations.find(
            (org: Organization) => org.id === organizationId
          )
        );
        message.success("Clock in Successfully");
        setBtnLoading(false);
        navigate("/dashboard");
        window.ipc.clockIn();
      } catch (error) {
        setBtnLoading(false);
        message.error(error.response.data.message);
      }
    } else {
      message.error("No internet connection");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const handleOpenLink = (url: string) => {
    event.preventDefault();
    window.ipc.openLinkPlease(url);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  });

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      const online = navigator.onLine;

      if (online) {
        window.ipc.showNotification(
          "Internet Connection",
          "Internet connection restored, Kindly clock in"
        );
      }
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between items-center">
      <Header />
      <div className="p-5 bg-white rounded-lg md:w-1/2">
        <div className="mb-4">
          <Link to="/" className="nav-text">
            <img className="" src={Logo} alt="Workotick" />
          </Link>
        </div>

        <h1 className="font-medium text-lg">
          {greetings()}, {name}
        </h1>

        <Form
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout={"vertical"}
          disabled={btnLoading}
        >
          <Form.Item
            name="organizationId"
            label={
              <>
                <span className="font-medium mr-1">
                  Select your organization
                </span>
                {loading ? (
                  <Spin
                    className="h-8"
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 15 }}
                        className="mx-2 mt-2"
                        spin
                      />
                    }
                  />
                ) : (
                  <Button
                    icon={
                      <ReloadOutlined color={"black"} onClick={fetchData} />
                    }
                    type="text"
                  ></Button>
                )}
              </>
            }
            required={false}
            rules={[
              {
                required: true,
                message: "Please select the organization",
              },
            ]}
          >
            <Select
              size="large"
              disabled={loading}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 4px" }}>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        handleOpenLink(
                          "https://dev.workotick.com/create-organization"
                        )
                      }
                      target="_blank"
                    >
                      Create new organization
                    </Button>
                  </Space>
                </>
              )}
            >
              {organizations.map((organization: Organization) => (
                <Select.Option value={organization.id} key={organization.id}>
                  <div className="flex items-center gap-x-1">
                    <Avatar src={organization.logo} />
                    <span className="">{organization.name}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {timezone && <span>{timezone}</span>}

          <Form.Item className="mt-4">
            <Button
              className="h-10 w-full font-medium"
              disabled={btnLoading}
              htmlType="submit"
              type="primary"
            >
              Clock In
            </Button>
          </Form.Item>
        </Form>

        <small>
          Note: Your screen will be monitored as soon as you clock-in.
        </small>
        <br />
        <button
          onClick={() => handleOpenLink(baseUrl.frontend)}
          className="text-blue-400"
        >
          <small>Visit Dashboard</small>
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
