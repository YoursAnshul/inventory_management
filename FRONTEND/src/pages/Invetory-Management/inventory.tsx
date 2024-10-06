import React, { Dispatch, useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import { Controller, useForm } from "react-hook-form";
import WebService from "../../Services/WebService";
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import { HiOutlineEnvelope, HiOutlineKey } from "react-icons/hi2";
import HelperService from "../../Services/HelperService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Grid, {
  GridColumn,

  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import DeleteModal from "../../components/Common/DeleteModal/DeleteModal";
import { UPDATE_ME_CALL, setDataInRedux } from "../../action/CommonAction";
const headers: GridHeader[] = [
  {
    title: "Inventory Name",
    class: "text-center",
  },
  {
    title: "Qty",
    class: "text-center",
  },
  {
    title: "Price",
    class: "text-center",
  },
  {
    title: "Category",
    class: "text-center",
  },
  {
    title: "Action",
    class: "text-center",
  },
];

interface propData {
  activeTab: string;
}

const  Inventory = (props: propData) => {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setIsEdit(false);
    setEditData("")
    reset({});
  };
  const handleShow = () => {
    setShow(true);
    setEditData("")
    reset({});
  };
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );
  const {
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
    getValues,
    register,
    reset,
  } = useForm<any>({});
  const dispatch: Dispatch<any> = useDispatch();

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const watchAllFields = watch();
  const [isEdit, setIsEdit] = useState(false);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState<any>(BsEyeSlash);
  const [showPassword, setShowPassword] = useState<any>();
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const [editData, setEditData] = useState<any>();
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    getUserList(1);
    getCategoryList();
  }, [props.activeTab]);

  const addUser = (data: any) => {
    if (data.id) {
      WebService.putAPI({
        action: "update-user/" + data.id,
        body: data,
        id: "add_user",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          toast.success("User Updated Successfully");
          dispatch(setDataInRedux({ type: UPDATE_ME_CALL, value: true }));
          getUserList(1);
        })
        .catch((e) => {
          toast.error("User Updatation Failed try again.");
        });
    } else {
      WebService.postAPI({ action: "inventory", body: data, id: "add_user" })
        .then((res: any) => {
          reset({});
          setShow(false);
          getUserList(1);
          toast.success("User Created Successfully");
        })
        .catch(() => {
          toast.error("User Creation Failed try again.");
        });
    }
  };

  const getCategoryList = () => {
    WebService.getAPI({
      action: `categories`,
      body: {  },
    })
      .then((res: any) => {
          let temp1: any[] = [];
          let roleValue: any[] = res.data;
          for (let i in roleValue) {
            temp1.push({
              ...roleValue[i],
              value: roleValue[i].name,
              id: roleValue[i].id,
            });
          }
          setRoleList(temp1);
      })
      .catch((e) => {
      });
  };

  const getUserList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    WebService.getAPI({
      action: `inventory?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
        }&date_to=${endDate ? endDate : ""}`,
      body: { page: page },
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        if (page == 1) {
          setTotalCount(res.pagination.totalRecords);
        }
        for (var i in res.data) {
          let columns: GridColumn[] = [];
          columns.push({
            value: res.data[i].name ? res.data[i].name : "N/A",
          });
          columns.push({
            value: res.data[i].available_qty ? res.data[i].available_qty : "N/A",
          });
          columns.push({
            value: res.data[i].price ? res.data[i].price : "N/A",
          });
          columns.push({
            value: res.data[i].category_id ? res.data[i].category_id : "N/A",
          });
          columns.push({ value: actionList(res.data[i]), type: "COMPONENT" });
          rowCompute.current.push({ data: columns });
          rows.push({ data: columns });
        }
        rowCompute.current = rows;
        setRows(rowCompute.current);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const actionList = (value: any) => {
    return (
      <div className="d-flex justify-content-center">
        <div>
          <button
            type="button"
            onClick={() => onEdit(value)}
            className="btn btn-edit editicon"
            data-toggle="tooltip"
            data-placement="top"
            title="Edit"
          >
            <span>
              <Link to="#">
                <MdModeEditOutline className="editicon" />
              </Link>
            </span>
          </button>
        </div>

        <div>
          <button
            className="btn btn-delete"
            onClick={() => onConfirmDelete(value)}
            data-toggle="tooltip"
            data-placement="top"
            title="Delete"
          >
            <span>
              <Link to="#">
                <FaTrashAlt className="trashicon" />
              </Link>
            </span>
          </button>
        </div>
      </div>
    );
  };
  const onEdit = (val: any) => {
    setEditData(val);
    reset(val);
    setIsEdit(true);
    setShow(true);
  };
  const onConfirmDelete = (val: any) => {
    setEditData(val);
    setDeleteModal(true);
  };
  const onDelete = () => {
    setDeleteModal(false);
    setShowLoader(true);
    WebService.deleteAPI({
      action: `inventory/${editData?.id}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData({});
        getUserList(1);
      })
      .catch((e) => {
        setShowLoader(false);
        setEditData({});
      });
  };

  return (
    <>
      <div className="container">
        <div className="justify-content-between d-flex mb-3 ">
          <span className="d-flex align-items-center">
            <h6 className="mb-0">In Details</h6>
          </span>
          <div>
            <span className="col-2 text-end ml-2">
              <Button variant="success" onClick={handleShow}>
                + New Inventory
              </Button>
            </span>
          </div>
        </div>
        <DeleteModal
          isShow={showDeleteModal}
          close={() => {
            setDeleteModal(false);
            setEditData("");
          }}
          onDelete={() => {
            onDelete();
          }}
        />
        <div className="table-card">
          <Grid
            searchPlaceholder="Search By Name/Email"
            rows={rows}
            showDateFilter={true}
            showSearch={true}
            headers={headers}
            ShowLoader={ShowLoader}
            count={totalCount}
            onPageChange={getUserList}
            errorMessage={"No User Found"}
          />
        </div>
      </div>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit' : 'Add'} Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="mb-3" onSubmit={handleSubmit(addUser)}>
            <div className="row">
              <div className="col-lg-6">
                <label className="mt-2">Inventory Name</label>
                <span className="text-danger">*</span>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Inventory Name"
                    {...register("name", { required: true })}
                  />
                </div>
                {errors.name && (
                  <div className="login-error mt-2">
                    <Label title={"Inventory Name required"} modeError={true} />
                  </div>
                )}
              </div>
              <div className="col-lg-6">
                <label className="mt-2">Price</label>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Price"
                    {...register("price", { required: false })}
                  />
                </div>
                {errors.price && (
                  <div className="login-error mt-2">
                    <Label title={"Inventory price required"} modeError={true} />
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="time-pickers position-relative w-100-mob w-100">
                  <Controller
                    control={control}
                    name="category_id"
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Form.Group className="mb-1">
                        <label className="mb-2 mt-2">{"Category Id"}</label>
                        <span className="text-danger">*</span>
                        <VendorSelect
                          onChange={(e: any) => {
                            field.onChange(e.id);
                          }}
                          isSearchable={true}
                          options={roleList}
                          selected={watchAllFields.category_id}
                        />
                      </Form.Group>
                    )}
                  />
                  {errors.category_id && (
                    <div className="login-error mt-3">
                      <Label
                        title={"Please Select category id"}
                        modeError={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              id="add_user"
              type="submit"
              className="btn-brand-1 w-100 mt-4"
            >
              Save
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>

  );
};

export default Inventory;
