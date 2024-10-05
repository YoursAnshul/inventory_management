import { Link } from 'react-router-dom';
import icon3 from '../../assets/images/menu-icon-3.svg'
import icon4 from '../../assets/images/menu-icon-4.svg'
import iconDashboard from "../../assets/images/icon-dashboard.svg"
import iconComplienceUser from "../../assets/images/icon-compli-user.svg"

import { MdSpaceDashboard, MdCategory, MdLocalGroceryStore, MdLayers, MdGroup, MdCoPresent, MdManageAccounts, MdOutlinePublicOff, MdGppGood } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { PiBatteryChargingVertical } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { LiaChargingStationSolid, LiaServicestack } from "react-icons/lia";
import { LuSettings, LuUsers } from "react-icons/lu";
import { LuIndianRupee } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { LuCalendarCheck } from "react-icons/lu";
import { LuLayoutDashboard } from "react-icons/lu";
import { useSelector } from 'react-redux';
import { RootState } from '../../config/Store';
import { useEffect } from 'react';

const VerticalMenu = () => {

    const userInfoData: any = useSelector<RootState, any>(
        (state: any) => state.userInfoData
    );

    useEffect(() => {
        console.log("sidebar--->", userInfoData.user_info)
        console.log("vendor", userInfoData.user_info.isVendor)
        console.log("id", !userInfoData.user_info.vendorId)
        console.log(userInfoData.user_info.isVendor === 0 && !userInfoData.user_info.vendorId)
    }, []);

    return (
        <>
            <div id="vertical_menu" className="verticle-menu">
                <div className="menu-list">
                    <Link id="t-1" to={'/dashboard'} className="menu-item"> <RxDashboard className="menu-icon" /> <span className='nav-text'>Dashboard</span></Link>
                    <Link id="t-1" to={'/feedback'} className="menu-item"><VscFeedback className="menu-icon" />  <span className='nav-text'>Feedback Management</span></Link>
                    <Link id="t-1" to={'/category-management'} className="menu-item"><VscFeedback className="menu-icon" />  <span className='nav-text'>Category-Management</span></Link>
                    <Link id="t-1" to={'/customer-management'} className="menu-item"><LuUsers className="menu-icon" />  <span className='nav-text'>Customer-Management</span></Link>
                    <Link id="t-1" to={'/users'} className="menu-item"> <LuUsers className="menu-icon" /> <span className='nav-text'>User Management</span></Link>
                </div>
            </div>
        </>
    )
}
export default VerticalMenu;