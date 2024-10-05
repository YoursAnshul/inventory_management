import {
  Routes,
  Route,
  Navigate,
  RoutesProps,
} from "react-router-dom";

import React, { Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../components/Main";
import { RootState } from "../config/Store";
import { UserState } from "../reducer/AuthReducer";
import { useSelector } from "react-redux";
const Navigation = () => {
  interface ProtectedRouteProps extends RoutesProps {
    isAuthenticated: boolean;
    authenticationPath: string;
  }

  const login: any = useSelector<RootState, UserState>(
    (state: any) => state.userLogin
  );

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
          </Route>
        </Routes>
      </div>
    </>
  );
};

export default Navigation;
