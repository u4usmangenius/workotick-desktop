import { useEffect, useState } from "react";
import {
  ReloadOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import Timer from "../components/Timer";
import { Memo } from "../../../types/Memo";
import { Get } from "../../../utils/api";
import { Project } from "../../../types/Project";
import { Button, Form, Select, Spin, Typography, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useForm } from "antd/es/form/Form";
const { Title } = Typography;

const Memo = () => {
  const [memoForm] = useForm();
  const [activeTime, setActiveTime] = useState(0); // Corrected: Initialize activeTime as a state variable
  let timerInterval: NodeJS.Timeout;
  const [memoData, setMemoData] = useState(null);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project>(null);
  const [loading, setloading] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const organizationId = localStorage.getItem("organization");

  const fetchData = async () => {
    setloading(true);
    try {
      const response = await Get(`desktop/${organizationId}/projects`, null);
      setProjects(response.data);
      setloading(false);
    } catch (error) {
      message.error("Something went wrong!");
      setloading(false);
    }
  };

  const handleFinish = (values: Memo) => {
    if (values.project_id) {
      window.ipc.sendMemo(values);
      setIsTimerRunning(true);
    } else {
      values.project_id = memoData.project_id;
      window.ipc.sendMemo(values);
    }
    setSelectedProject(
      projects.find((project) => project.id === parseInt(values.project_id))
    );

    setIsTimerRunning(true);
    setMemoData(values);
  };

  const stopTimer = () => {
    window.ipc.clearMemo();
    setBtnDisabled(true);
    setIsTimerRunning(false);
    setActiveTime(0);
  };

  useEffect(() => {
    // Timer interval to update activeTime
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setActiveTime((prevTime) => prevTime + 1); // Increment activeTime
      }, 1000);
    } else {
      clearInterval(timerInterval); // Clear interval when timer stops
    }

    return () => {
      clearInterval(timerInterval); // Cleanup interval on unmount
    };
  }, [isTimerRunning]);

  const fetchProjects = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  useEffect(() => {
    if (memoData) {
      memoForm.setFieldsValue(memoData);
    }
  }, [memoData, memoForm]);
  return (
    <div>
      <div className='my-3 flex justify-center items-center'>
        <div className='w-1/3 m-auto'>
          {isTimerRunning ? (
            <div style={{ textAlign: "center" }}>
              <Title level={4}>
                <Timer seconds={activeTime} />
              </Title>

              <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                <h1>Project: {selectedProject ? selectedProject.name : ""}</h1>
              </div>

              <Form
                layout='vertical'
                name='basic'
                onFinish={handleFinish}
                initialValues={{ memo: memoData?.memo || "" }}
                autoComplete='off'
                form={memoForm}>
                <div className='relative'>
                  <Form.Item
                    name='memo'
                    rules={[
                      {
                        required: true,
                        message: "Please input memo",
                      },
                    ]}>
                    <TextArea
                      maxLength={100}
                      disabled={btnDisabled}
                      style={{
                        height: 60,
                      }}
                      placeholder='What are you working on?'
                    />
                  </Form.Item>
                  {btnDisabled && (
                    <button
                      className='absolute top-1 right-1 px-1 border bg-white rounded-md'
                      onClick={() => setBtnDisabled(false)}>
                      <EditOutlined className='text-blue-700 ' />
                    </button>
                  )}
                </div>

                <Form.Item>
                  <Button
                    type='primary'
                    disabled={btnDisabled}
                    onClick={() => setBtnDisabled(true)}
                    htmlType='submit'>
                    Update Memo
                  </Button>
                </Form.Item>
              </Form>

              <Button onClick={stopTimer}>Stop Timer</Button>
            </div>
          ) : (
            <Form
              layout='vertical'
              name='basic'
              onFinish={handleFinish}
              autoComplete='off'>
              <Form.Item
                label={
                  <>
                    <span className='font-medium mr-1'>Project</span>
                    {loading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined
                            style={{ fontSize: 15 }}
                            className='mx-2'
                            spin
                          />
                        }
                      />
                    ) : (
                      <Button
                        icon={
                          <ReloadOutlined
                            color={"black"}
                            onClick={fetchProjects}
                          />
                        }
                        type='text'></Button>
                    )}
                  </>
                }
                required={false}
                name='project_id'
                rules={[
                  {
                    required: true,
                    message: "Please select project",
                  },
                ]}>
                <Select
                  showSearch
                  placeholder='Select Project'
                  options={projects}
                  disabled={loading}
                  fieldNames={{ label: "name", value: "id" }}
                />
              </Form.Item>

              <Form.Item
                label={<span className='font-medium'>Memo</span>}
                name='memo'
                required={false}
                rules={[
                  {
                    required: true,
                    message: "Please input memo",
                  },
                ]}>
                <TextArea
                  maxLength={100}
                  style={{
                    height: 60,
                  }}
                  placeholder='What are you working on?'
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 8,
                }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  disabled={loading}>
                  Start Timer
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Memo;
