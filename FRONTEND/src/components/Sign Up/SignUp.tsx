
import { Dispatch, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { HiOutlineKey } from "react-icons/hi2";
import { Form, Button } from 'react-bootstrap'
import "./sign-up.scss";
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import WebService from '../../Services/WebService';
import { toast } from 'react-toastify';
import { Label } from '../Common/Label/Label';
import { ROLE_PERMMISION_DATA, USER_INFO, USER_LOGIN_SUCCESS, USER_LOGOUT, setDataInRedux } from "../../action/CommonAction";
import VendorSelect from '../VendorSelect/VendorSelect';
import HelperService from '../../Services/HelperService';
import { registerLocale } from 'react-datepicker';


const SignUp = () => {
    const [password, setPassword] = useState("");
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState<any>(BsEyeSlash);
    const [showPassword, setShowPassword] = useState<any>();


    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const {
        handleSubmit,
        formState: { errors, isValid },
        control,
        watch,
        getValues,
        register,
        reset,
    } = useForm<any>({}); const watchAllFields = watch();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(BsEye);
            setType('text')
        } else {
            setIcon(BsEyeSlash)
            setType('password')
        }
    }

    const addUser = (data: any) => {
        WebService.postAPI({ action: "sign-up", body: data, id: "add_user" })
            .then((res: any) => {
                toast.success("User Created Successfully");
                if (res) {
                    navigate('/login');
                }
            })
            .catch(() => {
                toast.error("User Creation Failed try again.");
            });
    };

    return (
        <>
            <div className="">
                <div className="row no-gutter">
                    <div className="col-md-6 d-none d-md-flex loginbg-image"></div>


                    <div className="col-md-6 bg-light">
                        <div className="login d-flex align-items-center">

                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-10 col-xl-7 mx-auto">
                                        <div className=" login-card rounded-4 login d-flex align-items-center">
                                            <div className="px-lg-1 px-1 py-1 w-100">
                                                <form className="mb-3" onSubmit={handleSubmit(addUser)}>
                                                    <div className="row">
                                                        <label className="mt-2">First Name                                                        <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group mb-1 mt-2">
                                                            <input
                                                                type="text"
                                                                className="form-control ps-3 p-2"
                                                                placeholder="First Name"
                                                                {...register("first_name", { required: true })}
                                                            />
                                                        </div>
                                                        {errors.first_name && (
                                                            <div className="login-error mt-2">
                                                                <Label title={"First Name required"} modeError={true} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="row">
                                                        <label className="mt-2">Last Name                                                        <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group mb-1 mt-2">
                                                            <input
                                                                type="text"
                                                                className="form-control ps-3 p-2"
                                                                placeholder="Last Name"
                                                                {...register("last_name", { required: true })}
                                                            />
                                                        </div>
                                                        {errors.last_name && (
                                                            <div className="login-error mt-2">
                                                                <Label title={"Last Name required"} modeError={true} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="row">
                                                        <label className="mt-2">Mobile Number                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group mb-1 mt-2">
                                                            <input
                                                                type="text"
                                                                className="form-control ps-3 p-2"
                                                                placeholder="Mobile Number"
                                                                onKeyPress={HelperService.allowOnlyNumericValue10}
                                                                {...register("mobile_number", { required: true })}
                                                            />
                                                        </div>
                                                        {errors.mobile_number && (
                                                            <div className="login-error mt-2">
                                                                <Label
                                                                    title={"Mobile Number required"}
                                                                    modeError={true}
                                                                />
                                                            </div>
                                                        )}

                                                    </div>
                                                    <div className="row">
                                                        <label className="mt-2">Email                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Controller
                                                            control={control}
                                                            name="email"
                                                            rules={{
                                                                required: "false",
                                                                pattern: {
                                                                    value: emailRegex,
                                                                    message: "Enter valid email address",
                                                                },
                                                            }}
                                                            render={({
                                                                field: { onChange, onBlur },
                                                                fieldState: { isTouched, isDirty },
                                                            }) => (
                                                                <div>
                                                                    <div className="form-group">
                                                                        <div className="input-group mb-1 mt-2">
                                                                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                                                                <HiOutlineEnvelope size={16} />
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control ps-3 p-2"
                                                                                name="new-email"
                                                                                placeholder="Email Address"
                                                                                onChange={onChange}
                                                                                onBlur={onBlur}
                                                                                value={watch().email}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {(errors["email"]?.message ||
                                                                        Boolean(errors["email"]?.message) ||
                                                                        (isTouched && !watchAllFields.email) ||
                                                                        (watchAllFields.email &&
                                                                            !emailRegex.test(watchAllFields.email))) && (
                                                                            <div className="login-error">
                                                                                <Label
                                                                                    title={
                                                                                        errors.email?.message || watchAllFields.email
                                                                                            ? "Enter valid email address"
                                                                                            : "Please Enter Email."
                                                                                    }
                                                                                    modeError={true}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="row">

                                                        <label className="mt-3 mb-2"> Password
                                                            <span className="text-danger"></span>
                                                        </label>
                                                        <Controller
                                                            control={control}
                                                            name="password"
                                                            rules={{
                                                                required: "Please Enter Password",
                                                            }}
                                                            render={({
                                                                field: { onChange, onBlur },
                                                                fieldState: { isTouched },
                                                            }) => (
                                                                <div className="mb-3">
                                                                    <div className="form-group mb-2">
                                                                        <div className="input-group mb-2">
                                                                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                                                                <HiOutlineKey size={16} />
                                                                            </span>
                                                                            <input
                                                                                type={type}
                                                                                name="new-email"
                                                                                className="form-control ps-3 p-2"
                                                                                placeholder="Password"
                                                                                onChange={onChange}
                                                                                onBlur={onBlur}
                                                                                autoComplete="new-password"
                                                                            />

                                                                            <span
                                                                                className="input-group-text text-secondary bg-white border-start-0 cursor-pointer"
                                                                                onClick={handleToggle}
                                                                            >
                                                                                {type == "password" ? (
                                                                                    <BsEye size={16} />
                                                                                ) : (
                                                                                    <BsEyeSlash size={16} />
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {(errors["password"]?.message ||
                                                                        Boolean(errors["password"]?.message) ||
                                                                        (isTouched && !watchAllFields.password)) && (
                                                                            <div className="login-error">
                                                                                <Label
                                                                                    title={
                                                                                        errors.password?.message ||
                                                                                            watchAllFields.password
                                                                                            ? "Between 8 to 20 characters and at least one upper case, lower case, number and special character."
                                                                                            : "Please Enter Password."
                                                                                    }
                                                                                    modeError={true}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            )}
                                                        />


                                                    </div>
                                                    <div className="row">
                                                        <div className="form-group">
                                                            <>
                                                                <label className="mb-2">
                                                                    {" "}
                                                                    {"Confirm New Password"}
                                                                    <span className="text-danger"></span>
                                                                </label>
                                                                <Controller
                                                                    control={control}
                                                                    name="comfirmpassword"
                                                                    rules={{
                                                                        required: "Please Enter New Password",
                                                                        validate: (value: any) => {
                                                                            const { password } = getValues();
                                                                            return (
                                                                                password === value || "Passwords must match"
                                                                            );
                                                                        },
                                                                    }}
                                                                    render={({
                                                                        field: { onChange, onBlur },
                                                                        fieldState: { isTouched },
                                                                    }) => (
                                                                        <div className="mb-3">
                                                                            <div className="input-group mb-2">
                                                                                <span className="input-group-text bg-white border-end-0 text-secondary">
                                                                                    <HiOutlineKey size={16} />
                                                                                </span>
                                                                                <input
                                                                                    type={showPassword ? "text" : "password"}
                                                                                    className="form-control ps-3 p-2"
                                                                                    placeholder="Confirm New Password"
                                                                                    onChange={onChange}
                                                                                    onBlur={onBlur}
                                                                                />
                                                                                <span
                                                                                    className="input-group-text text-secondary bg-white border-start-0 cursor-pointer"
                                                                                    onClick={() =>
                                                                                        setShowPassword(!showPassword)
                                                                                    }
                                                                                >
                                                                                    {type == "password" ? (
                                                                                        <BsEye
                                                                                            size={16}
                                                                                            style={{ color: "#0B1956" }}
                                                                                        />
                                                                                    ) : (
                                                                                        <BsEyeSlash
                                                                                            size={16}
                                                                                            style={{ color: "#0B1956" }}
                                                                                        />
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            {(errors["comfirmpassword"]?.message ||
                                                                                Boolean(errors["comfirmpassword"]?.message) ||
                                                                                (isTouched &&
                                                                                    !watchAllFields.comfirmpassword) ||
                                                                                (watchAllFields.comfirmpassword &&
                                                                                    watchAllFields.password !=
                                                                                    watchAllFields.comfirmpassword)) && (
                                                                                    <div className="login-error">
                                                                                        <Label
                                                                                            title={
                                                                                                errors.comfirmpassword?.message ||
                                                                                                    watchAllFields.comfirmpassword
                                                                                                    ? "Passwords Must Match"
                                                                                                    : "Please Enter Confirm Password."
                                                                                            }
                                                                                            modeError={true}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                />
                                                            </>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        id="add_user"
                                                        type="submit"
                                                        className="btn-brand-1 w-100 mt-4"
                                                    >
                                                        Save
                                                    </Button>
                                                    <p className="text-end">
                                                        <Link to="/login" className="text-brand" style={{ color: 'blue', textDecoration: 'underline' }}>
                                                            Back to login
                                                        </Link>
                                                    </p>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    )

}
export default SignUp;