
import * as React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import CardComponent from "../../../components/card/Card";
import ReusableTable from "../../../components/table/table";
import TableToolbar from "../../../components/tabletoolbar/tableToolbar";
import TablePagination from "../../../components/tablepagination/tablepagination";
import TableSkeleton from "../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../components/card/errorUi/NoDataFoundUI";

import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes } from "../../../constants/ApiConstants";

interface Department {
  id: number;
  name: string;
  department_code?: string | null;
}

interface Faculty {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  department_name: string;
  designation?: string | null;
  employment_type?: string | null;
  status?: string | null;
}

interface Program {
  id: number;
  programe: string;
  department_id?: number | null;
}

interface Semester {
  id: number;
  semester_no: number;
  semester_name?: string | null;
}

interface Course {
  id: number;
  course_title: string;
  semester_id: number;
}


function getArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }
  return [];
}

export default function FacultyAssign() {
  // Existing faculty-list state
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    React.useState<number | "">("");

  const [faculties, setFaculties] = React.useState<Faculty[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;

  const [departmentsLoading, setDepartmentsLoading] =
    React.useState(true);
  const [facultyLoading, setFacultyLoading] =
    React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState("");

  // New assignment configuration state
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [semesters, setSemesters] = React.useState<Semester[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);

  const [selectedFaculty, setSelectedFaculty] =
    React.useState<number | "">("");
  const [selectedProgram, setSelectedProgram] =
    React.useState<number | "">("");
  const [selectedSemester, setSelectedSemester] =
    React.useState<number | "">("");
  const [selectedCourse, setSelectedCourse] =
    React.useState<number | "">("");
  const [selectedBatch, setSelectedBatch] = React.useState("");

  const [configLoading, setConfigLoading] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);
  const [assignMessage, setAssignMessage] = React.useState("");
  const [assignError, setAssignError] = React.useState("");

  // Load departments and programs
  React.useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setDepartmentsLoading(true);
      setErrorMessage("");

      try {
        const [departmentResponse, programResponse] =
          await Promise.all([
            apiRequest({
              url: ApiRoutes.HODDEPARTMENTLIST,
              method: "get",
            }),
            apiRequest({
              url: ApiRoutes.GETPROGRAMLIST,
              method: "get",
            }),
          ]);

        if (!active) return;

        setDepartments(getArray<Department>(departmentResponse));
        setPrograms(getArray<Program>(programResponse));
      } catch (error: any) {
        if (active) {
          setErrorMessage(
            error?.message ||
              "Failed to load departments or programs."
          );
        }
      } finally {
        if (active) setDepartmentsLoading(false);
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  // Load faculty for selected department.
  // If no department is selected, load all faculty.
  React.useEffect(() => {
    let active = true;

    async function loadFaculty() {
      setFacultyLoading(true);
      setErrorMessage("");
      setFaculties([]);
      setPage(0);

      try {
        const response = await apiRequest({
          url: ApiRoutes.HODFACULTYLIST,
          method: "get",
          params:
            selectedDepartment === ""
              ? {}
              : { department_id: selectedDepartment },
        });

        if (active) {
          setFaculties(getArray<Faculty>(response));
        }
      } catch (error: any) {
        if (active) {
          setFaculties([]);
          setErrorMessage(
            error?.message || "Failed to load faculty."
          );
        }
      } finally {
        if (active) setFacultyLoading(false);
      }
    }

    loadFaculty();

    return () => {
      active = false;
    };
  }, [selectedDepartment]);

  // Load semesters and courses when program changes
  // Load semesters and courses when program changes
  React.useEffect(() => {
    let active = true;

    setSelectedSemester("");
    setSelectedCourse("");
    setSemesters([]);
    setCourses([]);
    setAssignError("");
    setAssignMessage("");

    if (selectedProgram === "") {
      setConfigLoading(false);
      return () => {
        active = false;
      };
    }

    async function loadProgramData() {
      setConfigLoading(true);

      try {
        const [semesterResponse, courseResponse] =
          await Promise.all([
            apiRequest({
              url: `${ApiRoutes.PROGRAMFETCH}/${selectedProgram}/semesters`,
              method: "get",
            }),
            apiRequest({
              url: `${ApiRoutes.PROGRAMFETCH}/${selectedProgram}/courses`,
              method: "get",
            }),
          ]);

        if (!active) return;

        // Handle common API response wrappers
        const semesterData =
          semesterResponse?.data?.semesters ??
          semesterResponse?.semesters ??
          semesterResponse?.data?.data ??
          semesterResponse?.data ??
          semesterResponse;

        const courseData =
          courseResponse?.data?.courses ??
          courseResponse?.courses ??
          courseResponse?.data?.data ??
          courseResponse?.data ??
          courseResponse;

        setSemesters(
          Array.isArray(semesterData) ? semesterData : []
        );

        setCourses(
          Array.isArray(courseData) ? courseData : []
        );
      } catch (error: any) {
        if (active) {
          setSemesters([]);
          setCourses([]);
          setAssignError(
            error?.response?.data?.detail ||
              error?.response?.data?.message ||
              error?.message ||
              "Failed to load semesters or courses."
          );
        }
      } finally {
        if (active) {
          setConfigLoading(false);
        }
      }
    }

    loadProgramData();

    return () => {
      active = false;
    };
  }, [selectedProgram]);

  // Keep courses consistent with selected semester
  // const filteredCourses = courses.filter(
  //   (course) =>
  //     selectedSemester !== "" &&                     
  //     course.semester_id === Number(selectedSemester)
  // );
  // Filter courses by selected semester
const filteredCourses = courses;

console.log("Selected semester:", selectedSemester);
console.log("All courses:", courses);
console.log("Filtered courses:", filteredCourses);

  // Existing faculty table formatting
  const formattedData = faculties.map((faculty, index) => ({
    ...faculty,
    sno: index + 1,
    full_name:
      `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim(),
    search_text: [
      faculty.employee_id,
      faculty.first_name,
      faculty.last_name,
      faculty.email,
      faculty.phone,
      faculty.department_name,
      faculty.designation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  const filteredFaculties = formattedData.filter((faculty) =>
    faculty.search_text.includes(searchText.toLowerCase())
  );

  async function handleAssign() {
    setAssignMessage("");
    setAssignError("");

    if (
      selectedDepartment === "" ||
      selectedFaculty === "" ||
      selectedProgram === "" ||
      selectedSemester === "" ||
      selectedCourse === "" ||
      !selectedBatch
    ) {
      setAssignError("Please select all assignment fields.");
      return;
    }

    setAssigning(true);

    try {
      const response = await apiRequest({
        url: "hod/assignments",
        method: "post",
        data: {
          staff_id: Number(selectedFaculty),
          program_id: Number(selectedProgram),
          course_id: Number(selectedCourse),
          semester_id: Number(selectedSemester),
          batch: selectedBatch,
        },
      });

      setAssignMessage(
        response?.message || "Faculty assigned successfully."
      );

      // Clear assignment-specific selections after success
      setSelectedFaculty("");
      setSelectedProgram("");
      setSelectedSemester("");
      setSelectedCourse("");
      setSelectedBatch("");
    } catch (error: any) {
      setAssignError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Faculty assignment failed."
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <CardComponent
      sx={{
        width: "100%",
        maxWidth: { xs: "350px", sm: "900px", md: "1300px" },
        mx: "auto",
        p: 3,
        mt: 3,
      }}
    >
      {/* EXISTING FACULTY LIST */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Faculty Assign
      </Typography>

      <Box sx={{ mb: 3, maxWidth: 450 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="hod-department-label">
            Select Department
          </InputLabel>

          <Select
            labelId="hod-department-label"
            value={selectedDepartment}
            label="Select Department"
            disabled={departmentsLoading}
            onChange={(event) => {
              const value = String(event.target.value);

              setSelectedDepartment(
                value === "" ? "" : Number(value)
              );

              setSelectedFaculty("");
              setSearchText("");
              setPage(0);
            }}
          >
            <MenuItem value="">
              <em>All Departments</em>
            </MenuItem>

            {departments.map((department) => (
              <MenuItem
                key={department.id}
                value={department.id}
              >
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {departmentsLoading && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Loading departments...
          </Typography>
        )}
      </Box>

      <TableToolbar
        filters={[
          {
            key: "search",
            label: "Search",
            type: "text",
            value: searchText,
            onChange: (value: string) => {
              setSearchText(value);
              setPage(0);
            },
            placeholder: "Search faculty...",
            visible: true,
          },
        ]}
        actions={[]}
      />

      {facultyLoading ? (
        <TableSkeleton />
      ) : errorMessage ? (
        <Typography color="error" sx={{ py: 2 }}>
          {errorMessage}
        </Typography>
      ) : filteredFaculties.length === 0 ? (
        <NoDataFoundUI />
      ) : (
        <ReusableTable
          columns={[
            { key: "employee_id", label: "Employee ID" },
            { key: "full_name", label: "Full Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Mobile" },
            { key: "department_name", label: "Department" },
            { key: "designation", label: "Designation" },
            { key: "employment_type", label: "Employment Type" },
          ]}
          data={filteredFaculties}
          page={page}
          rowsPerPage={rowsPerPage}
          actions={[]}
        />
      )}

      {!facultyLoading && !errorMessage && (
        <TablePagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredFaculties.length}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      {/* NEW FACULTY ASSIGNMENT CONFIGURATION */}
      <Box
        sx={{
          mt: 5,
          pt: 3,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Assign Program, Semester and Course
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Select a faculty member and assign the program,
          semester, course and batch they are responsible for.
        </Typography>

        {assignMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {assignMessage}
          </Alert>
        )}

        {assignError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {assignError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >
          {/* Department */}
          <FormControl fullWidth size="small">
            <InputLabel id="assign-department-label">
              Department
            </InputLabel>

            <Select
              labelId="assign-department-label"
              value={selectedDepartment}
              label="Department"
              onChange={(event) => {
                const value = String(event.target.value);
                setSelectedDepartment(
                  value === "" ? "" : Number(value)
                );
                setSelectedFaculty("");
              }}
            >
              <MenuItem value="">
                <em>Select Department</em>
              </MenuItem>

              {departments.map((department) => (
                <MenuItem
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Faculty */}
          <FormControl fullWidth size="small">
            <InputLabel id="assign-faculty-label">
              Faculty
            </InputLabel>

            <Select
              labelId="assign-faculty-label"
              value={selectedFaculty}
              label="Faculty"
              disabled={facultyLoading || faculties.length === 0}
              onChange={(event) =>
                setSelectedFaculty(
                  String(event.target.value) === ""

                    ? ""
                    : Number(event.target.value)
                )
              }
            >
              <MenuItem value="">
                <em>Select Faculty</em>
              </MenuItem>

              {faculties.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.employee_id} — {person.first_name}{" "}
                  {person.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Program */}
          <FormControl fullWidth size="small">
            <InputLabel id="assign-program-label">
              Program
            </InputLabel>

            <Select
              labelId="assign-program-label"
              value={selectedProgram}
              label="Program"
              onChange={(event) =>
                setSelectedProgram(
                  String(event.target.value) === ""
                    ? ""
                    : Number(event.target.value)
                )
              }
            >
              <MenuItem value="">
                <em>Select Program</em>
              </MenuItem>

              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.programe}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Semester */}
          <FormControl
            fullWidth
            size="small"
            disabled={!selectedProgram || configLoading}
          >
            <InputLabel id="assign-semester-label">
              Semester
            </InputLabel>

            <Select
              labelId="assign-semester-label"
              value={selectedSemester}
              label="Semester"
              onChange={(event) => {
                setSelectedSemester(
                  String(event.target.value) === ""
                    ? ""
                    : Number(event.target.value)
                );
                setSelectedCourse("");
              }}
            >
              <MenuItem value="">
                <em>Select Semester</em>
              </MenuItem>

              {semesters.map((semester) => (
                <MenuItem
                  key={semester.id}
                  value={semester.id}
                >
                  {semester.semester_name ||
                    `Semester ${semester.semester_no}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Course */}
          <FormControl
            fullWidth
            size="small"
            disabled={!selectedSemester || configLoading}
          >
            <InputLabel id="assign-course-label">
              Course
            </InputLabel>

            <Select
              labelId="assign-course-label"
              value={selectedCourse}
              label="Course"
              onChange={(event) =>
                setSelectedCourse(
                  String(event.target.value) === ""
                    ? ""
                    : Number(event.target.value)
                )
              }
            >
              <MenuItem value="">
                <em>Select Course</em>
              </MenuItem>

              {filteredCourses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.course_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Batch */}
          <FormControl fullWidth size="small">
            <InputLabel id="assign-batch-label">
              Batch
            </InputLabel>

            <Select
              labelId="assign-batch-label"
              value={selectedBatch}
              label="Batch"
              onChange={(event) =>
                setSelectedBatch(event.target.value)
              }
            >
              <MenuItem value="">
                <em>Select Batch</em>
              </MenuItem>
              <MenuItem value="January">January</MenuItem>
              <MenuItem value="July">July</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {configLoading && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Loading program configuration...
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={assigning || configLoading}
          onClick={handleAssign}
        >
          {assigning ? "Assigning..." : "Assign Faculty"}
        </Button>
      </Box>
    </CardComponent>
  );
}