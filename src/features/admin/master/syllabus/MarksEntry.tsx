import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  MenuItem,
  Select,
  Typography,
  Button,
  FormControl,
  InputLabel,
  TextField,
  Stack,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import TablePagination from "../../../../components/tablepagination/tablepagination";
import { useAlert } from "../../../../context/AlertContext";
import { useGlobalError } from "../../../../context/ErrorContext";
import apiClient from "../../../../services/ApiClient";
import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import { exportToExcel } from "../../../../constants/excelExport";
import { exportToWord } from "../../../../constants/wordExport";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { getValue } from "../../../../utils/localStorageUtil";

/* ---------------- TYPES ---------------- */
interface Program {
  id: number;
  programe: string;
  short_name: string | null;
}

interface Option {
  value: string;
  label: string;
}

interface StudentRow {
  id: number;
  reg_no: string | null;
  name: string;
  batch: string | null;
  admission_year: string | null;
  final_marks: number | null;
  pass_status: string | null;
  attendance_percentage: number | null;
  faculty_status: string;
  hod_status: string;
  director_status: string;
  reject_reason: string | null;
  is_arrear: boolean;
}

interface Scheme {
  id: number;
  programe_id: number;
  semester_id: number;
  course_title: string;
  has_internal: boolean;
  internal_min?: number | null;
  internal_max?: number | null;
  has_external: boolean;
  external_min?: number | null;
  external_max?: number | null;

}

const MARK_TYPES: Option[] = [
  { value: "internal", label: "Internal Mark" },
  { value: "external", label: "External Mark" },
];

/* ---------------- COMPONENT ---------------- */
export default function MarksEntryScreen() {
  const { clearError } = useGlobalError();
  const { showAlert, showConfirm } = useAlert();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  const [viewClicked, setViewClicked] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);

  const [filters, setFilters] = useState({
    programId: "",
    batch: "",
    semesterNo: "",
    courseId: "",
    markType: "",
  });

  const [marksInput, setMarksInput] = useState<Record<number, string>>({});
  const [attendanceInput, setAttendanceInput] = useState<Record<number, string>>({});

  const getHodStatusLabel = (status: string): string => {
    if (status === "Pending") return "Not Approved";
    return status;
  };
  const rollId = getValue("rollid");
  const isHOD = String(rollId) === "6";
  const isDirector = String(rollId) === "7";
  const isReviewer = isHOD || isDirector;

  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;



  /* ---------------- LOAD PROGRAMS + SCHEMES ---------------- */
  useEffect(() => {
    clearError();
    apiClient
      .get(ApiRoutes.GETPROGRAMLIST)
      .then((res) => setPrograms(res.data || []))
      .catch(() => showAlert("Failed to load program list", "error"));

    apiClient
      .get(ApiRoutes.SCHEMES)
      .then((res) => setSchemes(res.data || []))
      .catch(() => showAlert("Failed to load schemes", "error"));
  }, []);

  /* ---------------- LOAD SEMESTERS ---------------- */
  useEffect(() => {
    if (!filters.programId) {
      setSemesters([]);
      return;
    }
    apiClient
      .get(`${ApiRoutes.PROGRAMFETCH}/${filters.programId}/semesters`)
      .then((res) => {
        const list = res.data?.semesters || [];
        setSemesters(
          list.map((s: any) => ({
            value: String(s.semester_no),
            label: s.semester_name,
          }))
        );
      })
      .catch(() => showAlert("Failed to load semesters", "error"));
  }, [filters.programId]);

  /* ---------------- LOAD COURSES ---------------- */
  useEffect(() => {
    if (!filters.programId || !filters.semesterNo) {
      setCourses([]);
      return;
    }
    apiClient
      .get(
        `${ApiRoutes.PROGRAMFETCH}/${filters.programId}/courses?semester_no=${filters.semesterNo}`
      )
      .then((res) => {
        const list = res.data || [];
        setCourses(
          list.map((c: any) => ({
            value: String(c.id),
            label: c.course_title,
          }))
        );
      })
      .catch(() => showAlert("Failed to load courses", "error"));
  }, [filters.programId, filters.semesterNo]);

  useEffect(() => {
    if (!filters.programId) {
      setBatches([]);
      return;
    }
    apiClient
      .get(`${ApiRoutes.STUDENTBATCHES}?program_id=${filters.programId}`)
      .then((res) => {
        const list: string[] = res.data || [];
        setBatches(list.map((b) => ({ value: b, label: b })));
      })
      .catch(() => showAlert("Failed to load batches", "error"));
  }, [filters.programId]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setViewClicked(false);
    setStudents([]);
  };

  const selectedCourseLabel = courses.find((c) => c.value === filters.courseId)?.label;

  const activeScheme = schemes.find(
    (s) =>
      s.programe_id === Number(filters.programId) &&
      s.semester_id === Number(filters.semesterNo) &&
      s.course_title === selectedCourseLabel
  );

  const minMark =
    filters.markType === "internal"
      ? activeScheme?.internal_min
      : filters.markType === "external"
      ? activeScheme?.external_min
      : undefined;

  const maxMark =
    filters.markType === "internal"
      ? activeScheme?.internal_max
      : filters.markType === "external"
      ? activeScheme?.external_max
      : undefined;

  const isMarkValid = (marks: string): boolean => {
    if (marks === "" || maxMark === undefined || maxMark === null) return true;
    return Number(marks) <= maxMark;
  };

  const computePassStatus = (marks: string): "pass" | "fail" | null => {
    if (marks === "" || minMark === undefined || minMark === null) return null;
    return Number(marks) >= minMark ? "pass" : "fail";
  };

  const isViewEnabled = Boolean(
    filters.programId && filters.batch && filters.semesterNo && filters.courseId && filters.markType
  );

  const handleViewStudents = async () => {
    try {
      const res = await apiClient.get(ApiRoutes.STUDENTMARKSENTRY, {
        params: {
          program_id: filters.programId,
          batch: filters.batch,
          semester: `semester_${filters.semesterNo}`,
          course_name: selectedCourseLabel,
          mark_type: filters.markType,
        },
      });

      const rows: StudentRow[] = res.data || [];
      setStudents(rows);

      const prefill: Record<number, string> = {};
      const attendancePrefill: Record<number, string> = {};
      rows.forEach((r) => {
        if (r.final_marks !== null && r.final_marks !== undefined) {
          prefill[r.id] = String(r.final_marks);
        }
        if (r.attendance_percentage !== null && r.attendance_percentage !== undefined) {
          attendancePrefill[r.id] = String(r.attendance_percentage);
        }
      });
      setMarksInput(prefill);
      setAttendanceInput(attendancePrefill);
      setViewClicked(true);
    } catch (err) {
      showAlert("Failed to load students", "error");
    }
  };

  const handleMarkChange = (studentId: number, value: string) => {
    setMarksInput((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleAttendanceChange = (studentId: number, value: string) => {
    setAttendanceInput((prev) => ({ ...prev, [studentId]: value }));
  };

  // const isEligible = (attendance: string): boolean => {
  //   if (attendance === "") return true;   // not yet entered — don't block
  //   return Number(attendance) >= 75;
  // };

  const isAttendanceInRange = (attendance: string): boolean => {
    if (attendance === "") return true;
    const val = Number(attendance);
    return val >= 0 && val <= 100;
  };

  const isLowAttendance = (attendance: string): boolean => {
    if (attendance === "") return false;
    const val = Number(attendance);
    return val >= 0 && val < 75;
  };

  // const isLocked = students.length > 0 && students[0]?.status === "submitted";

  const saveMarks = async (status: "draft" | "approved" | "submitted") => {
    const invalidEntry = students.find(
      (s) => marksInput[s.id] && marksInput[s.id] !== "" && !isMarkValid(marksInput[s.id])
    );
    if (invalidEntry) {
      showAlert(`Marks cannot exceed ${maxMark} for ${invalidEntry.name}`, "error");
      return;
    }
    const invalidAttendanceEntry = students.find(
      (s) => attendanceInput[s.id] && attendanceInput[s.id] !== "" && !isAttendanceInRange(attendanceInput[s.id])
    );
    if (invalidAttendanceEntry) {
      showAlert(`Attendance must be between 0 and 100 for ${invalidAttendanceEntry.name}`, "error");
      return;
    }
    // const marksPayload = students
    //   .filter((s) => s.faculty_status !== "submitted" && marksInput[s.id] !== undefined && marksInput[s.id] !== "")
    //   .map((s) => ({
    //     student_id: s.id,
    //     final_marks: Number(marksInput[s.id]),
    //     pass_status: computePassStatus(marksInput[s.id]) || "fail",
    //     attendance_percentage: attendanceInput[s.id] ? Number(attendanceInput[s.id]) : null,
    //   }));

    // if (marksPayload.length === 0) {
    //   showAlert("Enter at least one mark before saving", "error");
    //   return;
    // }

    // try {
    //   await apiRequest({
    //     url: ApiRoutes.STUDENTMARKSENTRYBULK,
    //     method: "post",
    //     data: {
    //       program_id: Number(filters.programId),
    //       batch: filters.batch,
    //       semester: `semester_${filters.semesterNo}`,
    //       course_name: selectedCourseLabel,
    //       mark_type: filters.markType,
    //       status,
    //       marks: marksPayload,
    //     },
    //   });
    const marksPayload = students
      .filter((s) => s.faculty_status !== "Submitted" && marksInput[s.id] !== undefined && marksInput[s.id] !== "")
      .map((s) => ({
        student_id: s.id,
        final_marks: Number(marksInput[s.id]),
        pass_status: computePassStatus(marksInput[s.id]) || "fail",
        attendance_percentage: attendanceInput[s.id] ? Number(attendanceInput[s.id]) : null,
      }));

    if (marksPayload.length === 0) {
      showAlert("Enter at least one mark before saving", "error");
      return;
    }

    try {
      await apiRequest({
        url: ApiRoutes.STUDENTMARKSENTRYBULK,
        method: "post",
        data: {
          program_id: Number(filters.programId),
          batch: filters.batch,
          semester: `semester_${filters.semesterNo}`,
          course_name: selectedCourseLabel,
          mark_type: filters.markType,
          faculty_status: status === "submitted" ? "Submitted" : "Draft",
          marks: marksPayload,
        },
      });
      showAlert(`Marks ${status === "draft" ? "saved" : status} successfully`, "success");
      handleViewStudents();
    } catch (err) {
      showAlert("Failed to save marks", "error");
    }
  };

  // const handleSave = () => saveMarks("draft");
  // // const handleApprove = () => saveMarks("approved");
  // const handleSubmit = () => {
  //   showConfirm("Once submitted, marks cannot be edited. Continue?", () => saveMarks("submitted"));
  // };
  const handleSave = () => saveMarks("draft");
  const handleSubmit = () => {
    showConfirm("Once submitted, marks cannot be edited. Continue?", () => saveMarks("submitted"));
  };

  const handleHodApprove = async () => {
    try {
      await apiRequest({
        url: ApiRoutes.HODREVIEW,
        method: "put",
        data: {
          program_id: Number(filters.programId),
          batch: filters.batch,
          semester: `semester_${filters.semesterNo}`,
          course_name: selectedCourseLabel,
          mark_type: filters.markType,
          action: "approve",
        },
      });
      showAlert("Marks approved", "success");
      handleViewStudents();
    } catch (err) {
      showAlert("Failed to approve marks", "error");
    }
  };

  const handleHodReject = async () => {
    if (!rejectReasonInput.trim()) {
      showAlert("Please enter a rejection reason", "error");
      return;
    }
    try {
      await apiRequest({
        url: ApiRoutes.HODREVIEW,
        method: "put",
        data: {
          program_id: Number(filters.programId),
          batch: filters.batch,
          semester: `semester_${filters.semesterNo}`,
          course_name: selectedCourseLabel,
          mark_type: filters.markType,
          action: "reject",
          reject_reason: rejectReasonInput,
        },
      });
      showAlert("Marks rejected and sent back to faculty", "success");
      setShowRejectBox(false);
      setRejectReasonInput("");
      handleViewStudents();
    } catch (err) {
      showAlert("Failed to reject marks", "error");
    }
  };

  const handleDirectorApprove = async () => {
    try {
      await apiRequest({
        url: ApiRoutes.DIRECTORAPPROVE,
        method: "put",
        data: {
          program_id: Number(filters.programId),
          batch: filters.batch,
          semester: `semester_${filters.semesterNo}`,
          course_name: selectedCourseLabel,
          mark_type: filters.markType,
          academic_year: students[0]?.admission_year || null,
        },
      });
      showAlert("Marks approved by Director", "success");
      handleViewStudents();
    } catch (err) {
      showAlert("Failed to approve marks", "error");
    }
  };

  const visibleStudents = isDirector
    ? students.filter((s) => s.hod_status === "Approved")
    : isHOD
    ? students.filter((s) => s.faculty_status === "Submitted")
    : students;
  const paginatedStudents = visibleStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExportExcel = () => {
    // const exportRows = students.map((s, index) => {
    const sortedForExcel = [...students].sort((a, b) =>
      (a.reg_no || "").localeCompare(b.reg_no || "", undefined, { numeric: true })
    );

    const exportRows = sortedForExcel.map((s, index) => {
      const markValue = marksInput[s.id] ?? "";
      const attendanceValue = attendanceInput[s.id] ?? "";
      const attendanceValid = isAttendanceInRange(attendanceValue);
      const passStatus = computePassStatus(markValue);

      return {
        sno: index + 1,
        reg_no: s.reg_no,
        name: s.name,
        attendance_percentage: attendanceValue || s.attendance_percentage || "-",
        final_marks: markValue || s.final_marks || "-",
        pass_status: !attendanceValid && attendanceValue !== "" ? "NOT ELIGIBLE" : (passStatus ? passStatus.toUpperCase() : "-"),
        admission_year: s.admission_year || "-",
        batch: s.batch || "-",
        status: s.faculty_status,
      };
    });

    exportToExcel(
      exportRows,
      [ 
        { header: "S.No", key: "sno" },
        { header: "Register No", key: "reg_no" },
        { header: "Student Name", key: "name" },
        { header: "Attendance %", key: "attendance_percentage" },
        { header: "Marks", key: "final_marks" },
        { header: "Pass / Fail", key: "pass_status" },
        { header: "Academic Year", key: "admission_year" },
        { header: "Batch", key: "batch" },
        // { header: "Record Status", key: "status" },
      ],
      `Marks_${selectedCourseLabel}_${filters.markType}`,
      "Student_Marks"
    );
  };

    const handleExportWord = async () => {
    const programLabel =
      programs.find((p) => String(p.id) === filters.programId)?.short_name ||
      programs.find((p) => String(p.id) === filters.programId)?.programe ||
      "-";
    const semesterLabel =
      semesters.find((s) => s.value === filters.semesterNo)?.label || `Semester ${filters.semesterNo}`;
    const markTypeLabel = MARK_TYPES.find((m) => m.value === filters.markType)?.label || filters.markType;

    // const rows = visibleStudents.map((s, index) => {
     const sortedForWord = [...visibleStudents].sort((a, b) =>
      (a.reg_no || "").localeCompare(b.reg_no || "", undefined, { numeric: true })
    );
    const rows = sortedForWord.map((s, index) => {
      const markValue = marksInput[s.id] ?? s.final_marks ?? "-";
      const attendanceValue = attendanceInput[s.id] ?? s.attendance_percentage ?? "-";
      const passStatus = computePassStatus(String(markValue)) || s.pass_status || "-";
      return {
        sno: index + 1,
        reg_no: s.reg_no,
        name: s.name,
        attendance_percentage: attendanceValue,
        final_marks: markValue,
        pass_status: passStatus,
        admission_year: s.admission_year,
        batch: s.batch,
      };
    });

    await exportToWord(
      {
        programName: programLabel,
        batch: filters.batch,
        semester: semesterLabel,
        course: selectedCourseLabel || "-",
        markType: markTypeLabel,
      },
      rows,
      `Marks_${selectedCourseLabel}_${filters.markType}`
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8", p: 4 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* FILTER CARD */}
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ p: 3, borderRadius: 3 }}
        >
          <Typography variant="h6" mb={2}>
            Program Filter
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select
                  value={filters.programId}
                  label="Program"
                  onChange={(e) => handleChange("programId", e.target.value)}
                >
                  {programs.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>
                      {p.short_name ?? p.programe}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Batch</InputLabel>
                <Select
                  value={filters.batch}
                  label="Batch"
                  onChange={(e) => handleChange("batch", e.target.value)}
                >
                  {batches.map((b) => (
                    <MenuItem key={b.value} value={b.value}>
                      {b.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={filters.semesterNo}
                  label="Semester"
                  onChange={(e) => handleChange("semesterNo", e.target.value)}
                >
                  {semesters.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={filters.courseId}
                  label="Course"
                  onChange={(e) => handleChange("courseId", e.target.value)}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Mark Type</InputLabel>
                <Select
                  value={filters.markType}
                  label="Mark Type"
                  onChange={(e) => handleChange("markType", e.target.value)}
                >
                  {MARK_TYPES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
              <Button variant="contained" disabled={!isViewEnabled} onClick={handleViewStudents}>
                View Students
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* TABLE */}
        {viewClicked && (
          <Card sx={{ mt: 4, p: 3 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportWord}
                >
                  Export Word
                </Button>
              </Box>

            {/* <Alert severity="info" sx={{ mb: 2 }}>
              {minMark !== undefined && minMark !== null
                ? <>Minimum pass mark: <b>{minMark}</b></>
                : "No minimum mark configured in Scheme for this selection."}
            </Alert> */}
            <Alert severity="info" sx={{ mb: 2, fontSize: "1.1rem", "& .MuiAlert-message": { fontSize: "1.1rem" } }}>
              {minMark !== undefined && minMark !== null ? (
                <>Minimum pass mark: <b>{minMark}</b> &nbsp;|&nbsp; Maximum mark: <b>{maxMark ?? "-"}</b></>
              ) : (
                "No minimum/maximum mark configured in Scheme for this selection."
              )}
            </Alert>
            {!isDirector && (() => {
              const rejectedEntry = visibleStudents.find((s) => s.hod_status === "Rejected" && s.reject_reason);
              return rejectedEntry ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <b>Marks rejected by HOD:</b> {rejectedEntry.reject_reason} — please review and re-enter the marks, then resubmit.
                </Alert>
              ) : null;
            })()}

            {visibleStudents.length === 0 ? (
              <Alert severity="warning">
                {isDirector ? "No HOD-approved marks available for review yet." : "No students found for this program & semester."}
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Register No</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Attendance %</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Pass / Fail</TableCell>
                        {isDirector ? (
                          <TableCell>HOD Status</TableCell>
                        ) : isHOD ? (
                          <>
                            <TableCell>Admin Status</TableCell>
                            <TableCell>Director Status</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>Faculty Status</TableCell>
                            <TableCell>HOD Status</TableCell>
                            <TableCell>Director Status</TableCell>
                          </>
                        )}
                        <TableCell>Academic Year</TableCell>
                        <TableCell>Batch</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedStudents.map((s) => {
                        const markValue = marksInput[s.id] ?? "";
                        const attendanceValue = attendanceInput[s.id] ?? "";
                        const attendanceValid = isAttendanceInRange(attendanceValue);
                        const lowAttendance = isLowAttendance(attendanceValue);
                        const passStatus = computePassStatus(markValue);
                        // const rowLocked = s.status === "submitted";
                        const rowLocked = s.faculty_status === "Submitted" || isReviewer;

                        return (
                          <TableRow key={s.id}>
                            <TableCell>{s.reg_no}</TableCell>
                            {/* <TableCell>{s.name}</TableCell> */}
                            <TableCell>
                              {s.name}
                              {s.is_arrear && (
                                <Chip label="ARREAR" color="warning" size="small" sx={{ ml: 1 }} />
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                disabled={rowLocked}
                                value={attendanceValue}
                                onChange={(e) => handleAttendanceChange(s.id, e.target.value)}
                                error={attendanceValue !== "" && !attendanceValid}
                                helperText={attendanceValue !== "" && !attendanceValid ? "Must be between 0 and 100" : lowAttendance? "Low attendance (<75%)" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                disabled={rowLocked}
                                value={markValue}
                                onChange={(e) => handleMarkChange(s.id, e.target.value)}
                                error={markValue !== "" && !isMarkValid(markValue)}
                                helperText={
                                  markValue !== "" && !isMarkValid(markValue)
                                    ? `Max allowed: ${maxMark}`
                                    : ""
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                {passStatus ? (
                                  <Chip
                                    label={passStatus.toUpperCase()}
                                    color={passStatus === "pass" ? "success" : "error"}
                                    size="small"
                                  />
                                ) : (
                                  "-"
                                )}
                                {lowAttendance && (
                                  <Chip label="LOW ATTENDANCE" color="warning" size="small" />
                                )}
                              </Stack>
                            </TableCell>
                            {isDirector ? (
                              <TableCell>
                                <Chip
                                  label={getHodStatusLabel(s.hod_status)}
                                  size="small"
                                  color={s.hod_status === "Approved" ? "success" : "default"}
                                />
                              </TableCell>
                            ) : (
                              <>
                                <TableCell>
                                  <Chip
                                    label={s.faculty_status}
                                    size="small"
                                    color={s.faculty_status === "Submitted" ? "success" : "default"}
                                  />
                                </TableCell>
                                {!isHOD && (
                                <TableCell>
                                  <Chip
                                    label={getHodStatusLabel(s.hod_status)}
                                    size="small"
                                    color={s.hod_status === "Approved" ? "success" : s.hod_status === "Rejected" ? "error" : "default"}
                                  />
                                </TableCell>
                                )}
                                <TableCell>
                                  <Chip
                                    label={getHodStatusLabel(s.director_status)}
                                    size="small"
                                    color={s.director_status === "Approved" ? "success" : "default"}
                                  />
                                </TableCell>
                              </>
                            )}
                            <TableCell>{s.admission_year || "-"}</TableCell>
                            <TableCell>{s.batch || "-"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <TablePagination
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={visibleStudents.length}
                    onPageChange={setPage}
                  />
                </TableContainer>

                {!isReviewer && (
                  <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button color="error" variant="contained" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Stack>
                )}

                {isHOD && (
                  <Box mt={3}>
                    {showRejectBox && (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Rejection Reason"
                        value={rejectReasonInput}
                        onChange={(e) => setRejectReasonInput(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="contained" color="success" onClick={handleHodApprove}>
                        Approve
                      </Button>
                      {!showRejectBox ? (
                        <Button variant="outlined" color="error" onClick={() => setShowRejectBox(true)}>
                          Reject
                        </Button>
                      ) : (
                        <Button variant="contained" color="error" onClick={handleHodReject}>
                          Confirm Reject
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}

                {isDirector && (
                  <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                    <Button variant="contained" color="success" onClick={handleDirectorApprove}>
                      Approve
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
}