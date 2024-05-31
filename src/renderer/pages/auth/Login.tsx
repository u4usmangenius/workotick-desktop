import { useEffect, useState, useRef } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo-desktop.png";
import Footer from "../../Layout/footer";
import { Post } from "../../utils/api";
import { BaseUrl } from "../../utils/seturl";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);
  const baseUrl = BaseUrl("staging");
  const handleLogin = async (values: object) => {
    if (navigator.onLine) {
      setLoading(true);
      try {
        const response = await Post("desktop/login", values);
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        message.success("Login Successfully");
        setLoading(false);
        navigate("/home");
      } catch (error) {
        setLoading(false);
        if (error.response.status === 422 || error.response.status === 404) {
          message.error("Incorrect email or password");
        } else {
          message.error("Something went wrong!");
        }
      }
    } else {
      message.error("No internet connection");
    }
  };
  const handleOpenLink = (url: string) => {
    event.preventDefault();
    window.ipc.openLinkPlease(url);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, []);

  return (
    <div className=" bg-gray-100 flex flex-col min-h-screen justify-between">
      <div className="p-5 bg-white rounded-md w-4/5 md:w-1/2 lg:w-1/3 m-auto">
        <div className="mb-3">
          <a onClick={() => handleOpenLink(baseUrl.frontend)}>
            <img className="" src={Logo} ref={imgRef} alt="Workotick" />
          </a>
        </div>

        <div className="mb-3">
          <h1 className="font-normal text-xl">
            Login to your <span className="text-[#3376FF]">Workotick</span>{" "}
            account
          </h1>

          <p className="text-capitalize text-[#636B83] font-light text-sm">
            You are a click away from productivity
          </p>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          autoComplete="off"
          disabled={loading}
          onFinish={handleLogin}
        >
          <Form.Item
            label="Email"
            name="email"
            className="mb-2"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input a valid email address!",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            className="mb-2"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <div className="text-blue-400 text-end mb-1">
            <button
              onClick={() =>
                handleOpenLink(`${baseUrl.frontend}forgot-password`)
              }
            >
              Forgot password?
            </button>
          </div>

          <Form.Item>
            <Button
              loading={loading}
              className="w-full h-10"
              type="primary"
              htmlType="submit"
            >
              <span className="button-text">Login</span>
            </Button>
            <div className="mt-2">
              <span>
                Don't have an account ?{" "}
                <a
                  onClick={() => handleOpenLink(`${baseUrl.frontend}register`)}
                  className="text-blue-400"
                >
                  Register
                </a>
              </span>
            </div>
          </Form.Item>
        </Form>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
