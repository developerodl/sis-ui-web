
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { apiRequest } from "../../../utils/ApiRequest";
import { useAlert } from "../../../context/AlertContext";
import { ApiRoutes } from "../../../constants/ApiConstants";

type Option = {
  id: number;
  label: string;
  semesterNo?: number;
};

type UploadForm = {
  registration_no: string;
  program_id: string;
  semester_id: string;
  batch_id: string;
  course_id: string;
  academic_year_id: string;
};

type UploadResult = {
  id: number;
  student_id: number;
  registration_no: string;
  s3_key: string;
  status: string;
};

const initialForm: UploadForm = {
  registration_no: "",
  program_id: "",
  semester_id: "",
  batch_id: "",
  course_id: "",
  academic_year_id: "",
};

export default function AnswerSheetUpload() {
  const [form, setForm] = useState(initialForm);
  const [programs, setPrograms] = useState<Option[]>([]);
  const [years, setYears] = useState<Option[]>([]);
  const [batches, setBatches] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const { showAlert } = useAlert();

  // Load existing master data. No master APIs are modified.
//   useEffect(() => {
//     let active = true;

//     const loadOptions = async () => {
//       setLoadingOptions(true);
//       try {
//         const [programRes, yearRes, batchRes] = await Promise.all([
//           apiRequest({ url: ApiRoutes.GETPROGRAMLIST }),
//           apiRequest({ url: ApiRoutes.ACADEMICYEARLIST }),
//           apiRequest({ url: ApiRoutes.BATCHLIST }),
//         ]);

//         const programData = Array.isArray(programRes)
//           ? programRes
//           : programRes?.data ?? [];
//         const yearData = Array.isArray(yearRes)
//           ? yearRes
//           : yearRes?.data ?? [];
//         const batchData = Array.isArray(batchRes)
//           ? batchRes
//           : batchRes?.data ?? [];

//         if (!active) return;

//         setPrograms(
//           programData.map((p: any) => ({
//             id: Number(p.id),
//             label: String(p.programe ?? p.program_name ?? p.name ?? p.id),
//           }))
//         );

//         setYears(
//           yearData.map((y: any) => ({
//             id: Number(y.id),
//             label: String(y.year_code ?? y.academic_year ?? y.name ?? y.id),
//           }))
//         );

//         setBatches(
//           batchData.map((b: any) => ({
//             id: Number(b.id),
//             label: String(b.batch_name ?? b.name ?? b.id),
//           }))
//         );
//       } catch (e: any) {
//         if (active) {
//           setError(
//             typeof e?.message === "string"
//               ? e.message
//               : typeof e?.detail === "string"
//                 ? e.detail
//                 : "Could not load program, academic year, or batch options."
//           );
//         }
//       } finally {
//         if (active) setLoadingOptions(false);
//       }
//     };

//     loadOptions();
//     return () => {
//       active = false;
//     };
//   }, []);

useEffect(() => {
  let active = true;

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError("");

    try {
      const [programRes, yearRes] = await Promise.all([
        apiRequest({
          url: ApiRoutes.GETPROGRAMLIST,
          method: "get",
        }),
        apiRequest({
          url: "/academic-years",
          method: "get",
        }),
      ]);

      const programData = Array.isArray(programRes)
        ? programRes
        : programRes?.data ?? [];

      const yearData = Array.isArray(yearRes)
        ? yearRes
        : yearRes?.data ?? [];

      if (!active) return;

      setPrograms(
        programData.map((p: any) => ({
          id: Number(p.id),
          label: String(p.programe ?? p.program_name ?? p.name ?? p.id),
        }))
      );

      setYears(
        yearData.map((y: any) => ({
          id: Number(y.id),
          label: String(y.year_code ?? y.academic_year ?? y.name ?? y.id),
        }))
      );
    } catch (e: any) {
      if (active) {
        setError(
          e?.message ??
            e?.detail ??
            "Could not load programs or academic years."
        );
      }
    } finally {
      if (active) setLoadingOptions(false);
    }
  };

  loadOptions();

  return () => {
    active = false;
  };
}, []);

useEffect(() => {
  let active = true;

  setBatches([]);
  setForm((prev) => ({ ...prev, batch_id: "" }));

  if (!form.academic_year_id) return;

  const loadBatches = async () => {
    try {
      const res = await apiRequest({
        url: `/batches/academic-year/${form.academic_year_id}`,
        method: "get",
      });

      const data = Array.isArray(res)
        ? res
        : res?.data ?? [];

      if (!active) return;

      setBatches(
        data.map((b: any) => ({
          id: Number(b.id),
          label: String(b.batch_name ?? b.name ?? b.id),
        }))
      );
    } catch (e: any) {
      if (active) {
        setError(
          e?.message ??
            e?.detail ??
            "Could not load batches for the selected academic year."
        );
      }
    }
  };

  loadBatches();

  return () => {
    active = false;
  };
}, [form.academic_year_id]);


  // Load semesters for the selected program.
  useEffect(() => {
    let active = true;

    setSemesters([]);
    setCourses([]);
    setForm((prev) => ({
      ...prev,
      semester_id: "",
      course_id: "",
    }));

    if (!form.program_id) return;

    const loadSemesters = async () => {
      try {
        const res = await apiRequest({
          url: `${ApiRoutes.PROGRAMFETCH}/${form.program_id}/semesters`,
        });

        const data = Array.isArray(res?.semesters)
          ? res.semesters
          : Array.isArray(res?.data?.semesters)
            ? res.data.semesters
            : [];

        if (!active) return;

        setSemesters(
          data.map((s: any) => ({
            id: Number(s.id),
            semesterNo: Number(s.semester_no),
            label: String(
              s.semester_name ?? `Semester ${s.semester_no}`
            ),
          }))
        );
      } catch (e: any) {
        if (active) {
          setError(
            typeof e?.detail === "string"
              ? e.detail
              : "Could not load semesters for this program."
          );
        }
      }
    };

    loadSemesters();
    return () => {
      active = false;
    };
  }, [form.program_id]);

  // Load courses for the selected program and semester number.
  useEffect(() => {
    let active = true;
    setCourses([]);
    setForm((prev) => ({ ...prev, course_id: "" }));

    if (!form.program_id || !form.semester_id) return;

    const semester = semesters.find(
      (s) => String(s.id) === form.semester_id
    );

    if (!semester || !semester.semesterNo) return;

    const loadCourses = async () => {
      try {
        const res = await apiRequest({
          url: `${ApiRoutes.PROGRAMFETCH}/${form.program_id}/courses`,
          params: { semester_no: semester.semesterNo },
        });

        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (!active) return;

        setCourses(
          data.map((c: any) => ({
            id: Number(c.id),
            label: [c.course_code, c.course_title]
              .filter(Boolean)
              .join(" - ") || `Course ${c.id}`,
          }))
        );
      } catch (e: any) {
        if (active) {
          setError(
            typeof e?.detail === "string"
              ? e.detail
              : "Could not load courses for this semester."
          );
        }
      }
    };

    loadCourses();
    return () => {
      active = false;
    };
  }, [form.program_id, form.semester_id, semesters]);

  const updateField = (field: keyof UploadForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setError("");
  };

  const handleUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select the student's answer-sheet PDF.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("The PDF must be 20 MB or smaller.");
      return;
    }

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Please complete all student and examination fields.");
      return;
    }

    const body = new FormData();
    body.append("registration_no", form.registration_no.trim());
    body.append("program_id", form.program_id);
    body.append("semester_id", form.semester_id);
    body.append("batch_id", form.batch_id);
    body.append("course_id", form.course_id);
    body.append("academic_year_id", form.academic_year_id);
    body.append("file", file);

    setLoading(true);

    try {
      const response = await apiRequest({
        url: "/mark-evaluation/uploads",
        method: "post",
        data: body,
        headers: { "Content-Type": undefined },
      });

      setResult(response as UploadResult);
      setFile(null);
      showAlert("Answer sheet uploaded successfully.");
    } catch (e: any) {
      const message =
        e?.message ??
        e?.detail ??
        e?.data?.message ??
        (e?.message === undefined && e?.code === 409
          ? "An answer sheet already exists for this student and course context."
          : "Upload failed. Please check the entered details.");

      setError(
        typeof message === "string"
          ? message
          : "Upload failed. Please check the entered details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Answer Sheet Upload
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Enter the registration number, choose the examination details, and
        upload the answer-sheet PDF.
      </Typography>

      <Paper
        component="form"
        onSubmit={handleUpload}
        sx={{ p: { xs: 2, md: 4 } }}
      >
        <Typography variant="h6" mb={2}>
          Student and examination details
        </Typography>

        {loadingOptions && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Loading dropdown options…</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Registration Number"
            required
            value={form.registration_no}
            onChange={(e) =>
              updateField("registration_no", e.target.value)
            }
            placeholder="e.g. O0525001"
          />

          <TextField
            select
            label="Program"
            required
            value={form.program_id}
            disabled={loadingOptions || programs.length === 0}
            onChange={(e) => updateField("program_id", e.target.value)}
          >
            {programs.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Academic Year"
            required
            value={form.academic_year_id}
            disabled={loadingOptions || years.length === 0}
            onChange={(e) =>
              updateField("academic_year_id", e.target.value)
            }
          >
            {years.map((y) => (
              <MenuItem key={y.id} value={String(y.id)}>
                {y.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Batch"
            required
            value={form.batch_id}
            disabled={loadingOptions || batches.length === 0}
            onChange={(e) => updateField("batch_id", e.target.value)}
          >
            {batches.map((b) => (
              <MenuItem key={b.id} value={String(b.id)}>
                {b.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Semester"
            required
            value={form.semester_id}
            disabled={!form.program_id || semesters.length === 0}
            onChange={(e) => updateField("semester_id", e.target.value)}
          >
            {semesters.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Course"
            required
            value={form.course_id}
            disabled={!form.semester_id || courses.length === 0}
            onChange={(e) => updateField("course_id", e.target.value)}
          >
            {courses.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" mb={1}>
            Answer-sheet PDF
          </Typography>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
          >
            Choose PDF
            <input
              hidden
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setError("");
              }}
            />
          </Button>

          <Typography variant="body2" mt={1} color="text.secondary">
            {file
              ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
              : "PDF only · Maximum 20 MB"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography fontWeight={700}>Upload successful</Typography>
            Submission ID: {result.id}
            <br />
            Registration number: {result.registration_no}
            <br />
            Status: {result.status}
          </Alert>
        )}

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingOptions}
          >
            {loading ? "Submitting…" : "SUBMIT"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
