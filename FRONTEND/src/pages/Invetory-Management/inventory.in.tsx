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
    title: "Category",
    class: "text-center",
  },
  {
    title: "Created Date",
    class: "text-center",
  }
];

const  InventoryIn = () => {
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

  const watchAllFields = watch();
  const [isEdit, setIsEdit] = useState(false);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const [editData, setEditData] = useState<any>();
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);
  
  useEffect(() => {
    let exist = false;
  }, []);
  useEffect(() => {
    getUserList(1);
    getCategoryList();
    getInventoryList();
  }, [totalCount]);

  const addUser = (data: any) => {
      data["type"] = "IN";
      WebService.postAPI({ action: "inventory/transaction", body: data, id: "add_user" })
        .then((res: any) => {
          reset({});
          setShow(false);
          getUserList(1);
          toast.success("Inventory Created Successfully");
        })
        .catch(() => {
          toast.error("Inventory Creation Failed try again.");
        });
  };

  const getInventoryList = () => {
    WebService.getAPI({
      action: `inventory-details`,
      body: {  },
    }).then((res: any) => {
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

  const getCategoryList = () => {
    WebService.getAPI({
      action: `customers`,
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
          setCustomerList(temp1);
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
      action: `inventory/transactions?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
        }&date_to=${endDate ? endDate : ""}`,
      body: { page: page, type: "IN" },
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
            value: res.data[i].inventory_name ? res.data[i].inventory_name : "N/A",
          });
          columns.push({
            value: res.data[i].qty ? res.data[i].qty : "N/A",
          });
          columns.push({
            value: res.data[i].customer_name ? res.data[i].customer_name : "N/A",
          });
          columns.push({
            value: res.data[i].created_at
              ? HelperService.getFormatedDateForDetail(
                res.data[i].created_at,
                "MM/DD/YYYY"
              )
              : "N/A",
          });
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
                + Add Inventory
              </Button>
            </span>
          </div>
        </div>
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
            errorMessage={"No Inventory Found"}
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
                <div className="time-pickers position-relative w-100-mob w-100">
                  <Controller
                    control={control}
                    name="inventory_id"
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Form.Group className="mb-1">
                        <label className="mb-2 mt-2">{"Inventory Id"}</label>
                        <span className="text-danger">*</span>
                        <VendorSelect
                          onChange={(e: any) => {
                            field.onChange(e.id);
                          }}
                          isSearchable={true}
                          options={roleList}
                          selected={watchAllFields.inventory_id}
                        />
                      </Form.Group>
                    )}
                  />
                  {errors.inventory_id && (
                    <div className="login-error mt-3">
                      <Label
                        title={"Please Select Inventory id"}
                        modeError={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="time-pickers position-relative w-100-mob w-100">
                  <Controller
                    control={control}
                    name="customer_id"
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Form.Group className="mb-1">
                        <label className="mb-2 mt-2">{"Customer Id"}</label>
                        <span className="text-danger">*</span>
                        <VendorSelect
                          onChange={(e: any) => {
                            field.onChange(e.id);
                          }}
                          isSearchable={true}
                          options={customerList}
                          selected={watchAllFields.customer_id}
                        />
                      </Form.Group>
                    )}
                  />
                  {errors.customer_id && (
                    <div className="login-error mt-3">
                      <Label
                        title={"Please Select customer id"}
                        modeError={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <label className="mt-2">Qty</label>
                <span className="text-danger">*</span>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Qty"
                    {...register("qty", { required: true })}
                  />
                </div>
                {errors.qty && (
                  <div className="login-error mt-2">
                    <Label title={"Inventory qty required"} modeError={true} />
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

export default InventoryIn;
