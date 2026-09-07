import * as React from "react";

import {
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { useNavigate } from "react-router-dom";

import { useGlobalError } from "../../../../context/ErrorContext";
import { useAlert } from "../../../../context/AlertContext";
import { useLoader } from "../../../../context/LoaderContext";

import apiClient from "../../../../services/ApiClient";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import { apiRequest } from "../../../../utils/ApiRequest";

import { exportToExcel } from "../../../../constants/excelExport";

import CardComponent from "../../../../components/card/Card";
import TableToolbar from "../../../../components/tabletoolbar/tableToolbar";
import TableSkeleton from "../../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../../components/card/errorUi/NoDataFoundUI";
import ReusableTable from "../../../../components/table/table";
import TablePagination from "../../../../components/tablepagination/tablepagination";

import CustomDialog from "../../../../context/ConfirmDialog";

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

interface ProgramBatchSemester {
  id: number;

  program_id: number;

  batch: string;

  semester: string;

  Duefrmdate: string | null;

  Duetodate: string | null;

  course_start_date: string | null;

  course_end_date: string | null;

  exam_start_date: string | null;

  exam_end_date: string | null;
}

interface Program {
  id: number;

  programe?: string;

  program_name?: string;

  programe_code?: string;

  program_code?: string;
}

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

export default function ProgramBatchSemesterList() {
  const navigate = useNavigate();

  /* ----------------------------- CONTEXTS ----------------------------- */

  const { clearError } = useGlobalError();

  const { loading } = useLoader();

  const { showAlert } = useAlert();

  /* ----------------------------- STATE ----------------------------- */

  const [data, setData] =
    React.useState<ProgramBatchSemester[]>([]);

  const [programs, setPrograms] =
    React.useState<Program[]>([]);

  const [searchText, setSearchText] =
    React.useState("");

  const [programFilter, setProgramFilter] =
    React.useState("");

  const [page, setPage] =
    React.useState(0);

  const [rowsPerPage] =
    React.useState(10);

  const [openDelete, setOpenDelete] =
    React.useState(false);

  const [selectedRow, setSelectedRow] =
    React.useState<ProgramBatchSemester | null>(null);

  /* ---------------------------------------------------------------------- */
  /*                       GET PROGRAM BATCH SEMESTERS                     */
  /* ---------------------------------------------------------------------- */

  const fetchData = async () => {
    try {
      const res = await apiClient.get(
        ApiRoutes.PROGRAMBATCHSEMESTERGETALL
      );

      console.log(
        "Program Batch Semester API Response:",
        res.data
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setData(data);
    } catch (error) {
      console.error(
        "Failed to load program batch semesters:",
        error
      );

      showAlert(
        "Failed to load program batch semesters",
        "error"
      );

      setData([]);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                            GET PROGRAMS                                */
  /* ---------------------------------------------------------------------- */

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

      showAlert(
        "Failed to load programs",
        "error"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                             INITIAL LOAD                               */
  /* ---------------------------------------------------------------------- */

  React.useEffect(() => {
    clearError();

    fetchData();
    fetchPrograms();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                            PROGRAM MAP                                 */
  /* ---------------------------------------------------------------------- */

  const programMap = React.useMemo(() => {
    const map: Record<string, Program> = {};

    programs.forEach((program) => {
      map[String(program.id)] = program;
    });

    return map;
  }, [programs]);

  /* ---------------------------------------------------------------------- */
  /*                       ENRICH PROGRAM BATCH DATA                       */
  /* ---------------------------------------------------------------------- */

  const enrichedData = React.useMemo(() => {
    return data.map((item) => {
      const program =
        programMap[String(item.program_id)];

      return {
        ...item,

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
  }, [data, programMap]);

  /* ---------------------------------------------------------------------- */
  /*                          PROGRAM OPTIONS                              */
  /* ---------------------------------------------------------------------- */

  const programOptions = React.useMemo(
    () =>
      programs.map((program) => ({
        label: `${program.programe || program.program_name || ""}${
          program.programe_code ||
          program.program_code
            ? ` - (${program.programe_code || program.program_code})`
            : ""
        }`,

        value: String(program.id),
      })),
    [programs]
  );

  /* ---------------------------------------------------------------------- */
  /*                               FILTER                                  */
  /* ---------------------------------------------------------------------- */

  const filteredData = React.useMemo(() => {
    const search =
      searchText
        .trim()
        .toLowerCase();

    return enrichedData.filter((item) => {
      const searchValue = `
        ${item.program_name || ""}
        ${item.program_code || ""}
        ${item.program_id || ""}
        ${item.batch || ""}
        ${item.semester || ""}
        ${item.Duefrmdate || ""}
        ${item.Duetodate || ""}
        ${item.course_start_date || ""}
        ${item.course_end_date || ""}
        ${item.exam_start_date || ""}
        ${item.exam_end_date || ""}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchValue.includes(search);

      const matchesProgram =
        !programFilter ||
        String(item.program_id) ===
          String(programFilter);

      return (
        matchesSearch &&
        matchesProgram
      );
    });
  }, [
    enrichedData,
    searchText,
    programFilter,
  ]);

  /* ---------------------------------------------------------------------- */
  /*                              DELETE                                   */
  /* ---------------------------------------------------------------------- */

  const handleOpenDelete = (
    row: ProgramBatchSemester
  ) => {
    setSelectedRow(row);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setSelectedRow(null);
    setOpenDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) {
      return;
    }

    try {
      await apiRequest({
        url:
          `${ApiRoutes.PROGRAMBATCHSEMESTERDELETE}/${selectedRow.id}`,

        method: "delete",
      });

      setData((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedRow.id
        )
      );

      showAlert(
        "Program batch semester deleted successfully!",
        "success"
      );

      handleCloseDelete();
    } catch (error: any) {
      showAlert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete program batch semester.",
        "error"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              EXPORT                                    */
  /* ---------------------------------------------------------------------- */

  const handleExportExcel = () => {
    exportToExcel(
      filteredData.map(
        (item, index) => ({
          sno: index + 1,

          program_name:
            item.program_name || "",

          program_code:
            item.program_code || "",

          batch:
            item.batch || "",

          semester:
            item.semester || "",

          Duefrmdate:
            item.Duefrmdate || "",

          Duetodate:
            item.Duetodate || "",

          course_start_date:
            item.course_start_date || "",

          course_end_date:
            item.course_end_date || "",

          exam_start_date:
            item.exam_start_date || "",

          exam_end_date:
            item.exam_end_date || "",
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
          header: "Batch",
          key: "batch",
        },

        {
          header: "Semester",
          key: "semester",
        },

        {
          header: "Due From",
          key: "Duefrmdate",
        },

        {
          header: "Due To",
          key: "Duetodate",
        },

        {
          header: "Course Start Date",
          key: "course_start_date",
        },

        {
          header: "Course End Date",
          key: "course_end_date",
        },

        {
          header: "Exam Start Date",
          key: "exam_start_date",
        },

        {
          header: "Exam End Date",
          key: "exam_end_date",
        },
      ],

      "Program Batch Semester",
      "Program Batch Semester"
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                              TABLE COLUMNS                             */
  /* ---------------------------------------------------------------------- */

  const columns = [
    {
      key: "program_name",

      label: "Program",

      render: (
        row: ProgramBatchSemester & {
          program_name?: string;
          program_code?: string;
        }
      ) =>
        `${row.program_name || row.program_id || ""}${
          row.program_code
            ? ` - (${row.program_code})`
            : ""
        }`,
    },

    {
      key: "batch",

      label: "Batch",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.batch || "-",
    },

    {
      key: "semester",

      label: "Semester",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.semester || "-",
    },

    {
      key: "Duefrmdate",

      label: "Due From",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.Duefrmdate || "-",
    },

    {
      key: "Duetodate",

      label: "Due To",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.Duetodate || "-",
    },

    {
      key: "course_start_date",

      label: "Course Start",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.course_start_date || "-",
    },

    {
      key: "course_end_date",

      label: "Course End",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.course_end_date || "-",
    },

    {
      key: "exam_start_date",

      label: "Exam Start",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.exam_start_date || "-",
    },

    {
      key: "exam_end_date",

      label: "Exam End",

      render: (
        row: ProgramBatchSemester
      ) =>
        row.exam_end_date || "-",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                                  UI                                   */
  /* ---------------------------------------------------------------------- */

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
                "Search program, batch, semester",

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
              label:
                "Add Program Batch Semester",

              color: "primary",

              onClick: () =>
                navigate(
                  "/program-batch-semester/add"
                ),
            },
          ]}
        />

        {/* Table */}

        {loading ? (
          <TableSkeleton />
        ) : filteredData.length === 0 ? (
          <NoDataFoundUI />
        ) : (
          <ReusableTable
            columns={columns}
            data={filteredData}
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
                    `/program-batch-semester/edit/${row.id}`
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
            filteredData.length
          }
          onPageChange={(newPage) =>
            setPage(newPage)
          }
        />
      </CardComponent>

      {/* Delete Dialog */}

      <CustomDialog
        open={openDelete}
        title="Delete Program Batch Semester"
        description={
          <>
            Are you sure you want to
            delete this program batch
            semester?

            {selectedRow && (
              <Box
                sx={{
                  mt: 1,
                }}
              >
                <strong>
                  {programMap[
                    String(
                      selectedRow.program_id
                    )
                  ]?.programe ||
                    programMap[
                      String(
                        selectedRow.program_id
                      )
                    ]?.program_name ||
                    selectedRow.program_id}
                </strong>

                {(
                  programMap[
                    String(
                      selectedRow.program_id
                    )
                  ]?.programe_code ||
                  programMap[
                    String(
                      selectedRow.program_id
                    )
                  ]?.program_code
                ) && (
                  <>
                    {" - ("}
                    {
                      programMap[
                        String(
                          selectedRow.program_id
                        )
                      ]?.programe_code ||
                        programMap[
                          String(
                            selectedRow.program_id
                          )
                        ]?.program_code
                    }
                    {")"}
                  </>
                )}

                {" - "}

                <strong>
                  {
                    selectedRow.batch
                  }
                </strong>

                {" - "}

                <strong>
                  {
                    selectedRow.semester
                  }
                </strong>
              </Box>
            )}
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