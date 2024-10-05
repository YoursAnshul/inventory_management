import React, { Dispatch, useEffect, useRef, useState } from "react";
import "./category.scss";
import { Container, Row, Form, Card, Button, Table } from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
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
    title: "Name",
    class: "text-center",
  },
  {
    title: "Date",
    class: "text-center",
  },
  {
    title: "Action",
    class: "text-center",
  }
];
const CategoryManagement = () => {
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
  const [isAccess, setIsAccess] = useState<boolean>(false);
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
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const [editData, setEditData] = useState<any>();
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);

  useEffect(() => {
      getCategoryList(1);
  }, []);

  const addUser = (data: any) => {
    if (data.id) {
      WebService.putAPI({
        action: "update-category/" + data.id,
        body: data,
        id: "add_user",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          toast.success("Category Updated Successfully");
          dispatch(setDataInRedux({ type: UPDATE_ME_CALL, value: true }));
          getCategoryList(1);
        })
        .catch((e) => {
          toast.error("Category Updatation Failed try again.");
        });
    } else {
      WebService.postAPI({ action: "add-category", body: data, id: "add_user" })
        .then((res: any) => {
          reset({});
          setShow(false);
          getCategoryList(1);
          toast.success("Category Created Successfully");
        })
        .catch(() => {
          toast.error("Category Creation Failed try again.");
        });
    }
  };

  const getCategoryList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    WebService.getAPI({
      action: `list-categories?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
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
            value: res.data[i].created_at
              ? HelperService.getFormatedDateForDetail(
                res.data[i].created_at,
                "MM/DD/YYYY"
              )
              : "N/A",
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
      <div className="action-btns row">
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
      action: `delete-category/${editData?.id}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData({});
        getCategoryList(1);
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
            <h5 className="mb-0">Category Management</h5>
          </span>
          <div>
              <span className="col-2 text-end ml-2">
                <Button variant="success" onClick={handleShow}>
                  + Add
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
            onPageChange={getCategoryList}
            errorMessage={"No Category Found"}
          />
        </div>
      </div>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit' : 'Add'} Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="mb-3" onSubmit={handleSubmit(addUser)}>
            <div className="row">
              <div className="col-lg-12">
                <label className="mt-2">Name</label>
                <span className="text-danger">*</span>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Name"
                    {...register("name", { required: true })}
                  />
                </div>
                {errors.name && (
                  <div className="login-error mt-2">
                    <Label title={"Name required"} modeError={true} />
                  </div>
                )}
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

export default CategoryManagement;
