import {
  Routes,
  Route,
  Navigate,
  RouteProps,
  RoutesProps,
} from "react-router-dom";

import React, { Suspense, useEffect } from "react";
import { useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../components/Main";
import { RootState } from "../config/Store";
import { UserState } from "../reducer/AuthReducer";
import { useSelector } from "react-redux";
import Dashboard from "../pages/Dashboard/Dashboard";
import CategoryManagement from "../pages/Category-Management/category";
const Navigation = () => {
  interface ProtectedRouteProps extends RoutesProps {
    isAuthenticated: boolean;
    authenticationPath: string;
  }

  const login: any = useSelector<RootState, UserState>(
    (state: any) => state.userLogin
  );

  // element = { defaultProtectedRouteProps.isAuthenticated || login.loginSuccess ? (<Navigate replace to="/dashboard" />) : item.component }

  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, "outlet"> = {
    isAuthenticated: localStorage.getItem("token") != null,
    authenticationPath: "/login",
  };

  const Login = React.lazy(() => import("../components/Login/Login"));

  const Users = React.lazy(() => import("../pages/Users/Users"));

  const Feedback = React.lazy(() => import("../pages/Feedback/Feedback"));
  const Feedbackdetails = React.lazy(
    () => import("../pages/Feedbackdetails/Feedbackdetails")
  );


  return (
    <>
      <div id="main-wraper">
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<></>}>
                {defaultProtectedRouteProps.isAuthenticated ||
                  login.loginSuccess ? (
                  <Navigate replace to="/dashboard" />
                ) : (
                  <Login />
                )}
              </Suspense>
            }
          />
          <Route
            path="/"
            element={
              defaultProtectedRouteProps.isAuthenticated ||
                login.loginSuccess ? (
                <Navigate replace to="/dashboard" />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute
                {...defaultProtectedRouteProps}
                outlet={<Main />}
              />
            }
          >
            <Route
              path="/users"
              element={
                <Suspense fallback={<></>}>
                  {" "}
                  <Users />{" "}
                </Suspense>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<></>}>
                  {" "}
                  <Dashboard />{" "}
                </Suspense>
              }
            />
            <Route
              path="/feedback"
              element={
                <Suspense fallback={<></>}>
                  {" "}
                  <Feedback />{" "}
                </Suspense>
              }
            />
            <Route
              path="/feedbackdetails"
              element={
                <Suspense fallback={<></>}>
                  {" "}
                  <Feedbackdetails />{" "}
                </Suspense>
              }
            />
            <Route
              path="/category-management"
              element={
                <Suspense fallback={<></>}>
                  {" "}
                  <CategoryManagement />{" "}
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </div>
    </>
  );
};

export default Navigation;
