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


export default function FeeDetailList() {
  const navigate = useNavigate();

  const { clearError } = useGlobalError();

  const { loading } = useLoader();

  const { showAlert } = useAlert();

  const [page, setPage] = React.useState(0);

  const [rowsPerPage] = React.useState(10);

  const [searchText, setSearchText] = React.useState("");

  const [feeDetails, setFeeDetails] = React.useState<any[]>([]);

  const [programs, setPrograms] = React.useState<any[]>([]);

  const [programFilter, setProgramFilter] = React.useState("");

  const [openDelete, setOpenDelete] = React.useState(false);

  const [selectedFeeDetail, setSelectedFeeDetail] =
    React.useState<any>(null);

  // const rollid = Number(getValue("rollid"));

  const role = String(getValue("role_name") || "").trim().toLowerCase();
  const isFaculty = role === "faculty" || role === "faculty1";
  /* ---------------------------- GET FEE DETAILS ---------------------------- */

  const fetchFeeDetails = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.FEEDETAILGETALL
      );

      console.log(
        "Fee Details API Response:",
        res.data
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

      showAlert(
        "Failed to load fee details",
        "error"
      );

      setFeeDetails([]);
    }
  };

  /* ---------------------------- GET PROGRAMS ---------------------------- */

  const fetchPrograms = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.GETPROGRAMLIST
      );

      console.log(
        "Program API Response:",
        res.data
      );

      setPrograms(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load programs:",
        error
      );

      setPrograms([]);
    }
  };

  React.useEffect(() => {
    clearError();

    fetchFeeDetails();
    fetchPrograms();
  }, []);

  /* ---------------------------- PROGRAM MAP ---------------------------- */

  const programMap = React.useMemo(() => {
    const map: Record<string, any> = {};

    programs.forEach((program) => {
      map[String(program.id)] = program;
    });

    return map;
  }, [programs]);

  /* ---------------------------- ENRICH FEE DETAILS ---------------------------- */

  const enrichedFeeDetails = React.useMemo(() => {
    return feeDetails.map((fee) => {
      const program =
        programMap[String(fee.programe_id)];

      return {
        ...fee,

        program_name:
          program?.programe ||
          program?.program_name ||
          "",

        program_code:
          program?.programe_code ||
          program?.program_code ||
          "",
      };
    });
  }, [feeDetails, programMap]);

  /* ---------------------------- PROGRAM FILTER ---------------------------- */

  React.useEffect(() => {
    // if (
    //   rollid === 3 &&
    //   programs.length > 0
    // ) {
      if (
    isFaculty &&
    programs.length > 0
  ) {
      setProgramFilter("1500038");
      setPage(0);
    }
  // }, [rollid, programs]);
  }, [isFaculty, programs]);

  const programOptions = React.useMemo(
    () =>
      programs.map((p) => ({
        label: `${p.programe || p.program_name || ""}${
          p.programe_code || p.program_code
            ? ` - (${p.programe_code || p.program_code})`
            : ""
        }`,
        value: String(p.id),
      })),
    [programs]
  );

  /* ---------------------------- FILTER ---------------------------- */

  const filteredFeeDetails =
    enrichedFeeDetails.filter((fee) => {
      const searchValue = `
        ${fee.program_name || ""}
        ${fee.program_code || ""}
        ${fee.programe_id || ""}
        ${fee.semester || ""}
        ${fee.application_fee || ""}
        ${fee.admission_fee || ""}
        ${fee.tuition_fee || ""}
        ${fee.exam_fee || ""}
        ${fee.lms_fee || ""}
        ${fee.lab_fee || ""}
        ${fee.total_fee || ""}
      `.toLowerCase();

      const matchesSearch =
        searchValue.includes(
          searchText.toLowerCase()
        );

      const matchesProgram =
        !programFilter ||
        String(fee.programe_id) ===
          String(programFilter);

      return (
        matchesSearch &&
        matchesProgram
      );
    });

  /* ---------------------------- DELETE ---------------------------- */

  const handleOpenDelete = (row: any) => {
    setSelectedFeeDetail(row);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setSelectedFeeDetail(null);
    setOpenDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFeeDetail?.id) {
      return;
    }

    try {
      await apiRequest({
        url: `${ApiRoutes.FEEDETAILDELETE}/${selectedFeeDetail.id}`,
        method: "delete",
      });

      setFeeDetails((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedFeeDetail.id
        )
      );

      showAlert(
        "Fee details deleted successfully!",
        "success"
      );

      handleCloseDelete();
    } catch (error: any) {
      showAlert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete fee details.",
        "error"
      );
    }
  };

  /* ---------------------------- EXPORT ---------------------------- */

  const handleExportExcel = () => {
    exportToExcel(
      filteredFeeDetails.map(
        (fee, index) => ({
          sno: index + 1,

          program_name:
            fee.program_name || "",

          program_code:
            fee.program_code || "",

          semester:
            fee.semester || "",

          application_fee:
            fee.application_fee ?? "0",

          admission_fee:
            fee.admission_fee ?? "0",

          tuition_fee:
            fee.tuition_fee ?? "0",

          exam_fee:
            fee.exam_fee ?? "0",

          lms_fee:
            fee.lms_fee ?? "0",

          lab_fee:
            fee.lab_fee ?? "0",

          total_fee:
            fee.total_fee ?? "0",
        })
      ),

      [
        {
          header: "S.No",
          key: "sno",
        },

        {
          header: "Program",
          key: "program_name",
        },

        {
          header: "Program Code",
          key: "program_code",
        },

        {
          header: "Semester",
          key: "semester",
        },

        {
          header: "Application Fee",
          key: "application_fee",
        },

        {
          header: "Admission Fee",
          key: "admission_fee",
        },

        {
          header: "Tuition Fee",
          key: "tuition_fee",
        },

        {
          header: "Exam Fee",
          key: "exam_fee",
        },

        {
          header: "LMS Fee",
          key: "lms_fee",
        },

        {
          header: "Lab Fee",
          key: "lab_fee",
        },

        {
          header: "Total Fee",
          key: "total_fee",
        },
      ],

      "Fee Details",
      "Fee Details"
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
                "Search fee details",

              visible: true,
            },

            {
              key: "program",

              label: "Select Program",

              type: "select",

              value: programFilter,

              onChange: (val) => {
                setProgramFilter(val);
                setPage(0);
              },

              options: programOptions,

              // disabled: rollid === 3,
              disabled: isFaculty,

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
              label: "Add Fee Details",

              color: "primary",

              onClick: () =>
                navigate(
                  "/fee-detail/add"
                ),
            },
          ]}
        />

        {/* Table */}

        {loading ? (
          <TableSkeleton />
        ) : filteredFeeDetails.length === 0 ? (
          <NoDataFoundUI />
        ) : (
          <ReusableTable
            columns={[
              {
                key: "semester",

                label: "Semester",
              },

              {
                key: "program_name",

                label: "Program",

                render: (row: any) =>
                  `${row.program_name || row.programe_id || ""}${
                    row.program_code
                      ? ` - (${row.program_code})`
                      : ""
                  }`,
              },

              {
                key: "application_fee",

                label: "Application Fee",

                render: (row: any) =>
                  row.application_fee ?? "0",
              },

              {
                key: "admission_fee",

                label: "Admission Fee",

                render: (row: any) =>
                  row.admission_fee ?? "0",
              },

              {
                key: "tuition_fee",

                label: "Tuition Fee",

                render: (row: any) =>
                  row.tuition_fee ?? "0",
              },

              {
                key: "exam_fee",

                label: "Exam Fee",

                render: (row: any) =>
                  row.exam_fee ?? "0",
              },

              {
                key: "lms_fee",

                label: "LMS Fee",

                render: (row: any) =>
                  row.lms_fee ?? "0",
              },

              {
                key: "lab_fee",

                label: "Lab Fee",

                render: (row: any) =>
                  row.lab_fee ?? "0",
              },

              {
                key: "total_fee",

                label: "Total Fee",

                render: (row: any) =>
                  row.total_fee ?? "0",
              },
            ]}

            data={filteredFeeDetails}

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
                    `/fee-detail/edit/${row.id}`
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
            filteredFeeDetails.length
          }

          onPageChange={(newPage) =>
            setPage(newPage)
          }
        />
      </CardComponent>

      {/* Delete Dialog */}

      <CustomDialog
        open={openDelete}

        title="Delete Fee Details"

        description={
          <>
            Are you sure you want to
            delete fee details for{" "}
            <strong>
              {selectedFeeDetail?.program_name ||
                selectedFeeDetail?.programe_id}
            </strong>{" "}
            -{" "}
            <strong>
              {selectedFeeDetail?.semester}
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
