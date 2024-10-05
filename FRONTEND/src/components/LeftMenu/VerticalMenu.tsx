import { Link } from 'react-router-dom';
import { RxDashboard } from "react-icons/rx";
import { LuUsers } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { useSelector } from 'react-redux';
import { RootState } from '../../config/Store';
import { useEffect } from 'react';

const VerticalMenu = () => {

    const userInfoData: any = useSelector<RootState, any>(
        (state: any) => state.userInfoData
    );

    useEffect(() => {
        console.log("sidebar--->", userInfoData.user_info)
    }, []);

    return (
        <>
            <div id="vertical_menu" className="verticle-menu">
                <div className="menu-list">
                    <Link id="t-1" to={'/dashboard'} className="menu-item"> <RxDashboard className="menu-icon" /> <span className='nav-text'>Dashboard</span></Link>
                    <Link id="t-1" to={'/inventory-management'} className="menu-item"> <RxDashboard className="menu-icon" /> <span className='nav-text'>Inventory Management</span></Link>
                    <Link id="t-1" to={'/category-management'} className="menu-item"><VscFeedback className="menu-icon" />  <span className='nav-text'>Category-Management</span></Link>
                    <Link id="t-1" to={'/customer-management'} className="menu-item"><LuUsers className="menu-icon" />  <span className='nav-text'>Customer-Management</span></Link>
                    <Link id="t-1" to={'/users'} className="menu-item"> <LuUsers className="menu-icon" /> <span className='nav-text'>User Management</span></Link>
                </div>
            </div>
        </>
    )
}
export default VerticalMenu;