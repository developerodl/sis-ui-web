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


export default function FeeHeadList() {

  const navigate = useNavigate();

  const { clearError } =
    useGlobalError();

  const { loading } =
    useLoader();

  const { showAlert } =
    useAlert();


  /* ----------------------------- state ----------------------------- */

  const [page, setPage] =
    React.useState(0);

  const [rowsPerPage] =
    React.useState(10);

  const [searchText, setSearchText] =
    React.useState("");

  const [feeHeads, setFeeHeads] =
    React.useState<any[]>([]);

  const [openDelete, setOpenDelete] =
    React.useState(false);

  const [selectedFeeHead, setSelectedFeeHead] =
    React.useState<any>(null);


  /* ---------------------------- GET FEE HEADS ---------------------------- */

  const fetchFeeHeads = async () => {

    try {

      const res = await apiClient.get(
        ApiRoutes.FEEHEADGETALL
      );

      console.log(
        "Fee Heads API Response:",
        res.data
      );


      const data =
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];


      setFeeHeads(data);

    } catch (error) {

      console.error(
        "Failed to load fee heads:",
        error
      );

      showAlert(
        "Failed to load fee heads",
        "error"
      );

      setFeeHeads([]);
    }
  };


  /* ----------------------------- INITIAL LOAD ----------------------------- */

  React.useEffect(() => {

    clearError();

    fetchFeeHeads();

  }, []);


  /* ----------------------------- FILTER ----------------------------- */

  const filteredFeeHeads =
    feeHeads.filter((feeHead) => {

      const searchValue = `
        ${feeHead.account_head || ""}
        ${feeHead.gl_code || ""}
      `.toLowerCase();


      return searchValue.includes(
        searchText.toLowerCase()
      );

    });


  /* ----------------------------- DELETE ----------------------------- */

  const handleOpenDelete = (
    row: any
  ) => {

    setSelectedFeeHead(row);

    setOpenDelete(true);
  };


  const handleCloseDelete = () => {

    setSelectedFeeHead(null);

    setOpenDelete(false);
  };


  const handleConfirmDelete = async () => {

    if (!selectedFeeHead?.id) {
      return;
    }


    try {

      await apiRequest({
        url:
          `${ApiRoutes.FEEHEADDELETE}/${selectedFeeHead.id}`,

        method: "delete",
      });


      setFeeHeads((prev) =>
        prev.filter(
          (item) =>
            item.id !==
            selectedFeeHead.id
        )
      );


      showAlert(
        "Fee head deleted successfully!",
        "success"
      );


      handleCloseDelete();

    } catch (error: any) {

      showAlert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete fee head.",
        "error"
      );
    }
  };


  /* ----------------------------- EXPORT ----------------------------- */

  const handleExportExcel = () => {

    exportToExcel(

      filteredFeeHeads.map(
        (feeHead, index) => ({

          sno: index + 1,

          account_head:
            feeHead.account_head || "",

          gl_code:
            feeHead.gl_code || "",

        })
      ),


      [

        {
          header: "S.No",
          key: "sno",
        },

        {
          header: "Account Head",
          key: "account_head",
        },

        {
          header: "GL Code",
          key: "gl_code",
        },

      ],


      "Fee Heads",

      "Fee Heads"
    );
  };


  /* -------------------------------- UI -------------------------------- */

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
                "Search fee heads",

              visible: true,
            },
          ]}


          actions={[
            {
              label: "Export Excel",

              color: "secondary",

              startIcon:
                <FileDownloadIcon />,

              onClick:
                handleExportExcel,
            },

            {
              label: "Add Fee Head",

              color: "primary",

              onClick: () =>
                navigate(
                  "/fee-head/add"
                ),
            },
          ]}
        />


        {/* Table */}

        {loading ? (

          <TableSkeleton />

        ) : filteredFeeHeads.length === 0 ? (

          <NoDataFoundUI />

        ) : (

          <ReusableTable

            columns={[
              {
                key: "account_head",

                label: "Account Head",

                render: (row: any) =>
                  row.account_head || "",
              },

              {
                key: "gl_code",

                label: "GL Code",

                render: (row: any) =>
                  row.gl_code || "",
              },
            ]}


            data={filteredFeeHeads}

            page={page}

            rowsPerPage={rowsPerPage}


            actions={[

              {
                label: "Edit",

                icon:
                  <EditIcon fontSize="small" />,

                color: "primary",

                onClick: (row) =>
                  navigate(
                    `/fee-head/edit/${row.id}`
                  ),
              },


              {
                label: "Delete",

                icon:
                  <DeleteIcon fontSize="small" />,

                color: "error",

                onClick:
                  handleOpenDelete,
              },

            ]}
          />
        )}


        {/* Pagination */}

        <TablePagination

          page={page}

          rowsPerPage={rowsPerPage}

          totalCount={
            filteredFeeHeads.length
          }

          onPageChange={(newPage) =>
            setPage(newPage)
          }
        />

      </CardComponent>


      {/* Delete Dialog */}

      <CustomDialog

        open={openDelete}

        title="Delete Fee Head"

        description={
          <>
            Are you sure you want to
            delete fee head{" "}

            <strong>
              {selectedFeeHead?.account_head || ""}
            </strong>

            {" "}with GL Code{" "}

            <strong>
              {selectedFeeHead?.gl_code || ""}
            </strong>
            ?
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