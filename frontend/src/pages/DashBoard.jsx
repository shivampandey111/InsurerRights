import Sidebar from './SideBar';
import PrimaryDashBoard from './PrimaryDashBoard';
import { Outlet } from 'react-router-dom';
import GlobalChat from './GlobalChat';

export default function Main(){
    return (
      <div className="bg-[#0C0C0C] h-screen flex font-['Inter',system-ui,sans-serif]">
        <Sidebar/>
      <Outlet/>
  </div>
    );
}