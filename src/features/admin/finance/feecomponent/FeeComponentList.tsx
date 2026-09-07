import * as React from "react";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { useNavigate } from "react-router-dom";

import { useGlobalError } from "../../../../context/ErrorContext";
import { useAlert } from "../../../../context/AlertContext";
import apiClient from "../../../../services/ApiClient";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import { useLoader } from "../../../../context/LoaderContext";

import { exportToExcel } from "../../../../constants/excelExport";

import CardComponent from "../../../../components/card/Card";
import TableToolbar from "../../../../components/tabletoolbar/tableToolbar";
import TableSkeleton from "../../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../../components/card/errorUi/NoDataFoundUI";
import ReusableTable from "../../../../components/table/table";
import TablePagination from "../../../../components/tablepagination/tablepagination";

import { apiRequest } from "../../../../utils/ApiRequest";
import CustomDialog from "../../../../context/ConfirmDialog";

import { getValue } from "../../../../utils/localStorageUtil";


export default function FeeComponentList() {
  const navigate = useNavigate();

  const { clearError } = useGlobalError();

  const { loading } = useLoader();

  const { showAlert } = useAlert();

  const [page, setPage] = React.useState(0);

  const [rowsPerPage] = React.useState(10);

  const [searchText, setSearchText] =
    React.useState("");

  const [feeComponents, setFeeComponents] =
    React.useState<any[]>([]);

  const [feeDetails, setFeeDetails] =
    React.useState<any[]>([]);

  const [feeDetailFilter, setFeeDetailFilter] =
    React.useState("");

  const [feeHeadFilter, setFeeHeadFilter] =
    React.useState("");

  const [openDelete, setOpenDelete] =
    React.useState(false);

  const [selectedComponent, setSelectedComponent] =
    React.useState<any>(null);

  const rollid =
    Number(getValue("rollid"));


  /* ---------------------------- FEE COMPONENT LIST ---------------------------- */

  const fetchFeeComponents = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.FEECOMPONENTGETALL
      );

      console.log(
        "Fee Components API Response:",
        res.data
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setFeeComponents(data);

    } catch (error) {
      console.error(
        "Failed to load fee components:",
        error
      );

      showAlert(
        "Failed to load fee components",
        "error"
      );

      setFeeComponents([]);
    }
  };


  /* ---------------------------- FEE DETAILS ---------------------------- */

  const fetchFeeDetails = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.FEEDETAILGETALL
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setFeeDetails(data);

    } catch (error) {
      console.error(
        "Failed to load fee details:",
        error
      );

      setFeeDetails([]);
    }
  };


  React.useEffect(() => {
    clearError();

    fetchFeeComponents();
    fetchFeeDetails();
  }, []);


  /* ---------------------------- FEE DETAIL OPTIONS ---------------------------- */

  const feeDetailOptions =
    React.useMemo(
      () =>
        feeDetails.map((fee) => ({
          label: `${fee.semester || ""} ${
            fee.programe_id
              ? `- (${fee.programe_id})`
              : ""
          }`,
          value: String(fee.id),
        })),
      [feeDetails]
    );


  /* ---------------------------- FEE HEAD OPTIONS ---------------------------- */

  const feeHeadOptions = [
    {
      label: "Application Fee",
      value: "1",
    },
    {
      label: "Admission Fee",
      value: "2",
    },
    {
      label: "Tuition Fee",
      value: "3",
    },
    {
      label: "LMS Fee",
      value: "4",
    },
    {
      label: "Exam Fee",
      value: "5",
    },
    {
      label: "Lab Fee",
      value: "6",
    },
  ];


  /* ---------------------------- FILTER ---------------------------- */

  const filteredComponents =
    feeComponents.filter(
      (component) => {

        const searchValue = `
          ${component.fee_detail_name || ""}
          ${component.fee_head_name || ""}
          ${component.amount || ""}
          ${component.fee_detail_id || ""}
          ${component.fee_head_id || ""}
        `.toLowerCase();

        const matchesSearch =
          searchValue.includes(
            searchText.toLowerCase()
          );

        const matchesFeeDetail =
          !feeDetailFilter ||
          String(
            component.fee_detail_id
          ) ===
            String(feeDetailFilter);

        const matchesFeeHead =
          !feeHeadFilter ||
          String(
            component.fee_head_id
          ) ===
            String(feeHeadFilter);

        return (
          matchesSearch &&
          matchesFeeDetail &&
          matchesFeeHead
        );
      }
    );


  /* ---------------------------- DELETE ---------------------------- */

  const handleOpenDelete = (
    row: any
  ) => {
    setSelectedComponent(row);
    setOpenDelete(true);
  };


  const handleCloseDelete = () => {
    setSelectedComponent(null);
    setOpenDelete(false);
  };


  const handleConfirmDelete =
    async () => {

      if (
        !selectedComponent?.id
      ) {
        return;
      }

      try {

        await apiRequest({
          url: `${ApiRoutes.FEECOMPONENTDELETE}/${selectedComponent.id}`,
          method: "delete",
        });

        setFeeComponents(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                selectedComponent.id
            )
        );

        showAlert(
          "Fee component deleted successfully!",
          "success"
        );

        handleCloseDelete();

      } catch (error: any) {

        showAlert(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Failed to delete fee component.",
          "error"
        );
      }
    };


  /* ---------------------------- EXPORT ---------------------------- */

  const handleExportExcel = () => {

    exportToExcel(

      filteredComponents.map(
        (component, index) => ({

          sno: index + 1,

          fee_detail_name:
            component.fee_detail_name || "",

          fee_head_name:
            component.fee_head_name || "",

          amount:
            component.amount ?? "0",

        })
      ),

      [
        {
          header: "S.No",
          key: "sno",
        },

        {
          header: "Fee Detail",
          key: "fee_detail_name",
        },

        {
          header: "Fee Head",
          key: "fee_head_name",
        },

        {
          header: "Amount",
          key: "amount",
        },
      ],

      "Fee Components",

      "Fee Components"
    );
  };


  /* ------------------------------- UI ------------------------------- */

  return (
    <>
      <CardComponent
        sx={{
          width: "100%",
          maxWidth: {
            xs: "350px",
            sm: "900px",
            md: "1400px",
          },
          mx: "auto",
          p: 3,
          mt: 3,
        }}
      >

        {/* Toolbar */}

        <TableToolbar
          filters={[
            {
              key: "search",

              label: "Search",

              type: "text",

              value: searchText,

              onChange: (val) => {

                setSearchText(val);

                setPage(0);
              },

              placeholder:
                "Search fee components",

              visible: true,
            },

            {
              key: "feeDetail",

              label:
                "Select Fee Detail",

              type: "select",

              value:
                feeDetailFilter,

              onChange: (val) => {

                setFeeDetailFilter(
                  val
                );

                setPage(0);
              },

              options:
                feeDetailOptions,

              sx: {
                width: 250,
              },

              menuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 250,
                    overflowY: "auto",
                  },
                },
              },
            },

            {
              key: "feeHead",

              label:
                "Select Fee Head",

              type: "select",

              value:
                feeHeadFilter,

              onChange: (val) => {

                setFeeHeadFilter(
                  val
                );

                setPage(0);
              },

              options:
                feeHeadOptions,

              sx: {
                width: 220,
              },
            },
          ]}

          actions={[
            {
              label:
                "Export Excel",

              color:
                "secondary",

              startIcon:
                <FileDownloadIcon />,

              onClick:
                handleExportExcel,
            },

            {
              label:
                "Add Fee Component",

              color:
                "primary",

              onClick:
                () =>
                  navigate(
                    "/fee-component/add"
                  ),
            },
          ]}
        />


        {/* Table */}

        {loading ? (

          <TableSkeleton />

        ) : filteredComponents.length ===
          0 ? (

          <NoDataFoundUI />

        ) : (

          <ReusableTable

            columns={[
              {
                key: "fee_detail_name",

                label:
                  "Fee Detail",

                render:
                  (row: any) =>
                    row.fee_detail_name ||
                    "-",
              },

              {
                key:
                  "fee_head_name",

                label:
                  "Fee Head",

                render:
                  (row: any) =>
                    row.fee_head_name ||
                    "-",
              },

              {
                key:
                  "amount",

                label:
                  "Amount",

                render:
                  (row: any) =>
                    row.amount ??
                    "0",
              },
            ]}

            data={
              filteredComponents
            }

            page={page}

            rowsPerPage={
              rowsPerPage
            }

            actions={[
              {
                label:
                  "Edit",

                icon:
                  <EditIcon fontSize="small" />,

                color:
                  "primary",

                onClick:
                  (row) =>
                    navigate(
                      `/fee-component/edit/${row.id}`
                    ),
              },

              {
                label:
                  "Delete",

                icon:
                  <DeleteIcon fontSize="small" />,

                color:
                  "error",

                onClick:
                  handleOpenDelete,
              },
            ]}
          />
        )}


        {/* Pagination */}

        <TablePagination
          page={page}

          rowsPerPage={
            rowsPerPage
          }

          totalCount={
            filteredComponents.length
          }

          onPageChange={(
            newPage
          ) =>
            setPage(
              newPage
            )
          }
        />

      </CardComponent>


      {/* Delete Dialog */}

      <CustomDialog

        open={
          openDelete
        }

        title="Delete Fee Component"

        description={
          <>
            Are you sure you want to
            delete this fee component?

            <br />

            <strong>
              {
                selectedComponent?.fee_detail_name
              }
            </strong>

            {" - "}

            <strong>
              {
                selectedComponent?.fee_head_name
              }
            </strong>
          </>
        }

        confirmText="Delete"

        cancelText="Cancel"

        onClose={
          handleCloseDelete
        }

        onConfirm={
          handleConfirmDelete
        }
      />

    </>
  );
}
