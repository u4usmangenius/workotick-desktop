import { Avatar, Button, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../utils/api";
import Logo from "../../../../assets/logo-desktop.png";
import { getNameForOrganization } from "../../../utils/auth";

const Header = () => {
  const navigate = useNavigate();
  const organizationId = localStorage.getItem("organization");
  const [loading, setLoading] = useState(false);
  const organization = getNameForOrganization();
  const handleClockout = async () => {
    setLoading(true);

    try {
      await Post(`desktop/${organizationId}/clock-out`, null);
      localStorage.removeItem("organization");
      window.ipc.clockOut();
      setLoading(false);
      message.success("clock out Successfully");
      navigate("/");
    } catch (error) {
      console.error("clock out Error:", error);
      setLoading(false);
      message.error("Failed to clock out. Please try again later.");
    }
  };

  return (
    <div className='flex flex-col sm:flex-row justify-between items-center bg-white p-3 px-4'>
      <img
        className=''
        src={Logo}
        width={200}
        alt='Workotick'
      />

      <div className='flex gap-3 items-center'>
        <div>
          <div className='flex items-center gap-1'>
            <Avatar src={organization.logo} />
            <span className=''>{organization.name}</span>
          </div>
        </div>

        <Button
          type='primary'
          loading={loading}
          className='w-fit '
          onClick={handleClockout}>
          Clock out
        </Button>
      </div>
    </div>
  );
};

export default Header;
