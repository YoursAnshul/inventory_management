import React, { useEffect, useRef, useState } from "react";
import "./dashboard.scss";
import WebService from "../../Services/WebService";
import Chart from 'chart.js/auto';
import { TooltipItem } from 'chart.js';
import { MdCategory } from "react-icons/md";
import { BiCart } from "react-icons/bi";
import { LuUsers } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import Users from "../Users/Users";


const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<any>({});
    const [dashboardGraphData, setDashboardGraphData] = useState<any>([]);
    const barChartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        getTotalUsers();
        getInAndOutInventory();
    }, []);

    useEffect(() => {
        renderBarChart();
    }, [dashboardGraphData]);

    const getTotalUsers = () => {
        WebService.getAPI({
            action: `dashboard`,
            body: {},
        }).then((res: any) => {
            if (res && res.data) {
                setDashboardData(res.data);
            }
        })
            .catch((e) => {
                console.error(e);
            });
    }

    const getInAndOutInventory = () => {
        WebService.getAPI({
            action: `inventory/in-out-graph`,
            body: {},
        }).then((res: any) => {
            if (res && res.data) {
                setDashboardGraphData(res.data);
            }
        })
            .catch((e) => {
                console.error(e);
            });
    }

    const renderBarChart = () => {
        const canvas = barChartRef.current;
        if (!canvas) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            const data = {
                names: dashboardGraphData?.map((item: any) => item.name),
                inQty: dashboardGraphData?.map((item: any) => Number(item.inQty)),
                outQty: dashboardGraphData?.map((item: any) => Number(item.outQty)),
            };

            const labels = data.names;
            const inData = data.inQty;
            const outData = data.outQty;

            chartInstanceRef.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'In Quantity',
                            data: inData,
                            backgroundColor: "#1360de",
                            barThickness: 28,
                            borderColor: "#0b4db6",
                            borderWidth: 2,
                        },
                        {
                            label: 'Out Quantity',
                            data: outData,
                            backgroundColor: "#ff6384",
                            barThickness: 28,
                            borderColor: "#d9534f",
                            borderWidth: 2,
                        }
                    ],
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10,
                            top: 10,
                            right: 20,
                            bottom: 10
                        }
                    },
                    plugins: {
                        tooltip: {
                            backgroundColor: '#333',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: (tooltipItem: TooltipItem<'bar'>) => {
                                    const value = tooltipItem.raw as number;
                                    return `${tooltipItem.dataset.label}: ${value}`;
                                }
                            }
                        },
                    },
                    scales: {
                        x: {
                            stacked: false,
                            grid: {
                                display: false
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 10,
                                align: 'center',
                                crossAlign: 'center',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                },
                                padding: 10
                            },

                            title: {
                                display: true,
                                text: 'Inventory',
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                        },
                        y: {
                            stacked: false,
                            beginAtZero: true,
                            ticks: {
                                stepSize: 10,
                                autoSkip: true,
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                },
                                callback: function (value: number | string) {
                                    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                                    return numericValue + "";
                                },
                                align: 'center',
                                crossAlign: 'center',
                            },
                            min: 0,
                            title: {
                                display: true,
                                text: "Quantity",
                                font: {
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                        }
                    }
                }
            });
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <LuUsers className="menu-icon icon-users" />
                        <br />
                        <span>TOTAL USERS</span>
                        <h3>{dashboardData.totalUsers}</h3>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <VscFeedback className="menu-icon icon-customers" />
                        <br />
                        <span>TOTAL CUSTOMERS</span>
                        <h3>{dashboardData.totalCustomers}</h3>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <MdCategory className="menu-icon icon-categories" />
                        <br />
                        <span>TOTAL CATEGORY</span>
                        <h3>{dashboardData.totalCategories}</h3>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="box p-3 dashboardup">
                        <BiCart className="menu-icon icon-inventory" />
                        <br />
                        <span>TOTAL INVENTORY</span>
                        <h3>{dashboardData.totalInventory}</h3>
                    </div>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-lg-12">
                    <canvas ref={barChartRef} style={{ width: '100%', height: '16%' }}></canvas>
                </div>
            </div>

        </>
    );
}

export default Dashboard;
