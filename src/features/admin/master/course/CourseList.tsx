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
import { useEffect } from "react";


export default function CourseList() {
  const navigate = useNavigate();
  const { clearError } = useGlobalError();
  const { loading } = useLoader();
  const { showAlert } = useAlert();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);
  const [searchText, setSearchText] = React.useState("");
  const [courses, setCourses] = React.useState<any[]>([]);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [programFilter, setProgramFilter] = React.useState("1500038");
  const [selectedCourses, setSelectedCourses] = React.useState<any>(null);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const rollid = Number(getValue('rollid'));
  const selectedProgramId = programFilter;
  /* ---------------------------- API CALL ---------------------------- */

  //    useEffect(() => {
  //     if (!selectedProgramId) {
  //         setCourses([]);
  //         setValue("course_id", 0);
  //         return;
  //     }

  //     const fetchCourses = async () => {
  //         try {
  //             const res = await apiClient.get(
  //                 `${ApiRoutes.PROGRAMFETCH}/${selectedProgramId}/courses`
  //             );

  //             const coursesList =
  //                 res.data?.courses || [];

  //             const mapped = coursesList.map(
  //                 (s: any) => ({
  //                     value: String(s.course_no),
  //                     label: `${s.course_name}`,
  //                 })
  //             );

  //            setCourseOptions(mapped);

  //         } catch {
  //             showAlert(
  //                 "Failed to load courses list",
  //                 "error"
  //             );
  //         }
  //     };

  //     fetchCourses();

  // }, [selectedProgramId]);


  useEffect(() => {
    if (!selectedProgramId) return;

    const fetchCourses = async () => {
      try {
        const res = await apiClient.get(
          `${ApiRoutes.PROGRAMFETCH}/${selectedProgramId}/courses`
        );

        console.log("Course API Response:", res.data);

        setCourses(res.data || []);
      } catch (error) {
        showAlert("Failed to load courses", "error");
      }
    };

    fetchCourses();
  }, [selectedProgramId]);

  React.useEffect(() => {
    clearError();

    apiClient
      .get(ApiRoutes.GETPROGRAMLIST)
      .then((res) => {
        setPrograms(res.data || []);
      })
      .catch(() => setPrograms([]));

  }, []);

  React.useEffect(() => {

    if (rollid == 3 && programs.length > 0) {
      setProgramFilter("1500038");
      setPage(0);
    }

  }, [rollid, programs]);

  const programOptions = React.useMemo(
    () =>
      programs.map((p) => ({
        label: p.programe,
        value: p.id,
      })),
    [programs]
  );

  /* ----------------------- DELETE WITH CONFIRM ---------------------- */

  const handleConfirmDelete = async () => {
    if (!selectedCourses?.id) return;

    try {
      await apiRequest({
        url: `${ApiRoutes.COURSES}/${selectedCourses.id}`,
        method: "delete",
      });

      setCourses((prev) =>
        prev.filter(
          (item) =>
            item.id !== selectedCourses.id
        )
      );

      showAlert(
        "Course deleted successfully!",
        "success"
      );

      handleCloseDelete();
    } catch (err: any) {
      showAlert(
        err.response?.data?.message ||
        "Failed to delete course.",
        "error"
      );
    }
  };

  const handleCloseDelete = () => {
    setSelectedCourses(null);
    setOpenDelete(false);
  };

  const handleOpenDelete = (row: any) => {
    setSelectedCourses(row);
    setOpenDelete(true);
  };

  /* ------------------------------- FILTER --------------------------- */

  const filteredCourses = courses.filter(
    (c) => {
      const combined = `
       ${c.program_name}
       ${c.program_code}
       ${c.semester_name}
       ${c.course_category}
       ${c.course_code}
       ${c.course_title}
       ${c.regulation_pattern}
    `.toLowerCase();

      return combined.includes(
        searchText.toLowerCase()
      );
    }
  );

  /* ------------------------------- EXPORT --------------------------- */

  const handleExportExcel = () => {
    exportToExcel(
      filteredCourses.map((c, index) => ({
        sno: index + 1,

        program_name: c.program_name,
        program_code: c.program_code,
        semester_name: c.semester_name,

        course_category: c.course_category,

        course_code: c.course_code,
        course_title: c.course_title,

        credits: c.credits,

        regulation_pattern: c.regulation_pattern,

        created_at: c.created_at,
        updated_at: c.updated_at,
      })),
      [
        { header: "S.No", key: "sno" },

        { header: "Program", key: "program_name" },
        { header: "Program Code", key: "program_code" },
        { header: "Semester", key: "semester_name" },

        { header: "Course Category", key: "course_category" },

        { header: "Course Code", key: "course_code" },
        { header: "Course Title", key: "course_title" },

        { header: "Credits", key: "credits" },

        { header: "Regulation", key: "regulation_pattern" },

        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
      ],
      "Courses",
      "Courses"
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
            md: "1300px",
          },
          mx: "auto",
          p: 3,
          mt: 3,
        }}
      >
        <TableToolbar
          filters={[
            {
              key: "search",
              label: "Search",
              type: "text",
              value: searchText,
              onChange: (val) =>
                setSearchText(val),
              placeholder:
                "Search courses",
              visible: true,
            },
            {
              key: "program",
              label: "Select Program",
              type: "select",
              value: programFilter,
              onChange: (val) => {
                console.log("Program Selected:", val);
                setProgramFilter(val);
                setPage(0);
              },
              options: programOptions,

              disabled:
                rollid === 3,

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

            }
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
              label: "Add Course",
              color: "primary",
              onClick: () =>
                navigate(
                  "/courses/add"
                ),
            },
          ]}
        />

        {loading ? (
          <TableSkeleton />
        ) : filteredCourses.length === 0 ? (
          <NoDataFoundUI />
        ) : (
          <ReusableTable
            columns={[
              {
                key: "course_code",
                label: "Course Code",
              },
              {
                key: "course_title",
                label: "Course Title",
              },
              {
                key: "course_category",
                label: "Category",
                render: (row: any) =>
                  `${row.category_name} - (${row.category_code})`,
              },
              {
                key: "semester_name",
                label: "Semester",
              },
              {
                key: "program_name",
                label: "Program",
                render: (row: any) =>
                  `${row.program_name} - (${row.program_code})`,
              },



              {
                key: "credits",
                label: "Credits",
              },
              {
                key: "regulation_pattern",
                label: "Regulation",
              },
            ]}

            data={filteredCourses}
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
                    `/courses/edit/${row.id}`
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

        <TablePagination
          page={page}
          rowsPerPage={
            rowsPerPage
          }
          totalCount={
            filteredCourses.length
          }
          onPageChange={(
            newPage
          ) =>
            setPage(newPage)
          }
        />
      </CardComponent>

      <CustomDialog
        open={openDelete}
        title="Delete Course"
        description={
          <>
            Are you sure you want to
            delete{" "}
            <strong>
              {
                selectedCourses?.course_title
              }
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