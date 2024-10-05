import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Tab,
  Nav,
  InputGroup,
  Form,
  Pagination,
  Button,
} from "react-bootstrap";

import TabCurrent from "./inventory.in";
import TabPast from "./inventory.out";
import TabInventory from "./inventory";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import HelperService from "../../Services/HelperService";
import { reduxState } from "../../reducer/CommonReducer";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Common/PageTitle";

interface propData {
  station: string;
}

const InventoryManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const stationName = queryParams.get('name');
  const chargeStationId = queryParams.get('station_id');


  const [activeTab, setActiveTab] = useState<string>("first");

  const commonData: any = useSelector<RootState, reduxState>(
    (state: any) => state.commonData
  );

  const RolePermission: any = useSelector<RootState, reduxState>(
    (state: any) => state.RolePermission
  );
  const [categoryData, setCategoryData] = useState<any>();
  const [domainClick, setDomainClick] = useState<any>();
  const [countryClick, setCountryClick] = useState<any>();

  useEffect(() => {
    if (
      RolePermission &&
      RolePermission?.rolePermission &&
      !HelperService.isEmptyObject(RolePermission?.rolePermission)
    ) {
      if (
        RolePermission?.rolePermission?.menus &&
        RolePermission?.rolePermission?.menus.length > 0
      ) {
        const data = RolePermission?.rolePermission?.menus.find(
          (item: any) => item.name == "Blacklisted"
        );
        if (data && data.is_read) {
          setCategoryData(data);
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [RolePermission]);

  return (
    <>
      <div className="container">
        <div className="app-page page-dashboard">
          <div className="justify-content-between d-flex mb-3 ">
            <span className="d-flex align-items-center">
              <h5 className="mb-0">Inventory Management</h5>
            </span>
            <div>
            </div>
          </div>
          <Tab.Container id="left-tabs-example" defaultActiveKey="first">
            <Row className="justify-content-between mb-3">
              <Col md={4}>
                <Nav variant="underline" className="tab-style-1">
                <Nav.Item>
                    <Nav.Link
                      onClick={() => setActiveTab("first")}
                      eventKey="first">
                      Available
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      onClick={() => setActiveTab("second")}
                      eventKey="second">
                      In
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      onClick={() => setActiveTab("third")}
                      eventKey="third">
                      Out
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <TabInventory/>
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                <TabCurrent/>
              </Tab.Pane>
              <Tab.Pane eventKey="third">
                <TabPast/>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </>
  );
};

export default InventoryManagement;
