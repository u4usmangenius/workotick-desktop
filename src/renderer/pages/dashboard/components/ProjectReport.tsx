import { useEffect, useState } from "react";
import { Button, Table, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { Post } from "../../../utils/api";
import { getTimeIntervalForOrganization } from "../../../utils/auth";
import moment from "moment";

function ProjectReport({
  reportData,
  loading,
  getData,
}: {
  reportData: object;
  loading: boolean;
  getData: () => object;
}) {
  const columns = [
    {
      title: "Project",
      dataIndex: "project",
      key: "name",
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>Logged Time</span>
          <Button
            icon={<ReloadOutlined color={"black"} />}
            type="text"
            onClick={getData}
          ></Button>
        </div>
      ),
      dataIndex: "time_logged",
      key: "logged_time",
    },
  ];

  return (
    <div className="m-4">
      <Table
        loading={loading}
        columns={columns}
        pagination={false}
        dataSource={reportData}
        size="small"
      />
    </div>
  );
}

export default ProjectReport;
