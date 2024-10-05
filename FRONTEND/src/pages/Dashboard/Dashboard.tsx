import React, { useEffect, useRef, useState } from "react";
import "./dashboard.scss";
import { Container, Row, Form, Col } from 'react-bootstrap'
import Users from '../../assets/images/users.svg'
import WebService from "../../Services/WebService";
import loader from "../../assets/images/loader.gif";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<any>({});

    useEffect(() => {
        getTotalUsers();
    }, []);

    const getTotalUsers = (
    ) => {
        WebService.getAPI({
            action: `dashboard`,
            body: {},
        }).then((res: any) => {
            if (res && res.data) {
                setDashboardData(res.data);
            }
        })
            .catch((e) => {
            });
    }

    return (

        <>
            <div className="row">
                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <img src={Users} /><br></br>
                        <span>TOTAL USERS</span>
                        <h3>{dashboardData.totalUsers}</h3>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <img src={Users} /><br></br>
                        <span>TOTAL CUSTOMERS</span>
                        <h3>{dashboardData.totalCustomers}</h3>
                    </div>
                </div>
                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <img src={Users} /><br></br>
                        <span>TOTAL CATEGORY</span>
                        <h3>{dashboardData.totalCategories}</h3>
                    </div>
                </div>
                <div className="col-lg-3
                ">
                    <div className="box p-3 dashboardup">
                        <img src={Users} /><br></br>
                        <span>TOTAL INVENTORY</span>
                        <h3>{dashboardData.totalInventory}</h3>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;