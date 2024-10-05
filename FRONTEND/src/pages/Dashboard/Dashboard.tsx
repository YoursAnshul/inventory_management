import React, { useEffect, useRef, useState } from "react";
import "./dashboard.scss";
import { Container, Row, Form, Col } from 'react-bootstrap'
import Loginbg from '../../assets/images/rupess.svg'
import Users from '../../assets/images/users.svg'
import Station from '../../assets/images/station.svg'
import Charge from '../../assets/images/charge.svg'
import Uparrow from '../../assets/images/uparrow.svg'
import DownArrow from '../../assets/images/down-arrow-red.svg'
import Chart2 from '../../assets/images/chart2.svg'
import Chart1 from '../../assets/images/chart1.svg'
import Chart from "chart.js";
import WebService from "../../Services/WebService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";
import EBDatePicker from "../../components/Common/EBDatePicker/EBDatePicker";
import loader from "../../assets/images/loader.gif";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";

const Dashboard = () => {   

    return (

        <>
            <div className="">
                <div>No Data Available</div>
            </div>
        </>
    );
}

export default Dashboard;