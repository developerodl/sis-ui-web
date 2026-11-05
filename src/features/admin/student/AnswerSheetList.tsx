
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { apiRequest } from "../../../utils/ApiRequest";

type Submission = {
  id: number;
//   student_id: number;
  student_name?: string | null;
  registration_no?: string | null;
  program_id: number;
  program_name?: string | null;
  academic_year_id: number;
  academic_year_name?: string | null;
  batch_id: number;
  batch_name?: string | null;
  semester_id: number;
  semester_name?: string | null;
//   course_id: number;
//   course_code?: string | null;
  course_title?: string | null;
  s3_key: string;
  status: string;
  evaluated_by_name?: string | null;
  last_updated_by?: number | null;
  last_updated_by_name?: string | null;
//   evaluation_updated_at?: string | null;
//   created_at?: string;
};

type Question = {
  question_no: number;
  max_marks: number;
};

type QuestionsResponse = {
  submission_id: number;
  questions: Question[];
  total_questions: number;
  total_max_marks: number;
};
type EvaluationResponse = {
  submission_id: number;
  question_marks: {
    question_no: number;
    marks: number;
  }[];
  total_marks: number;
  remarks: string | null;
  evaluated_by?: number;
};

type ViewUrlResponse = {
  view_url: string;
  submission_id: number;
  expires_in: number;
};

const statusOptions = ["All", "Pending", "Evaluated"];

function getErrorMessage(error: any): string {
  if (typeof error === "string") return error;

  return (
    error?.detail ||
    error?.message ||
    error?.data?.message ||
    "Something went wrong. Please try again."
  );
}

function unwrapResponse<T>(response: any): T {
  // Supports both a direct response and the project's
  // common { data: ... } response envelope.
  if (
    response &&
    !Array.isArray(response) &&
    response.data !== undefined
  ) {
    return response.data as T;
  }

  return response as T;
}

export default function AnswerSheetList() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState("");
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");
  const [evaluationSuccess, setEvaluationSuccess] = useState("");
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params =
        status === "All" ? {} : { submission_status: status };

      const response = await apiRequest({
        url: "/mark-evaluation/uploads",
        method: "get",
        params,
      });

      const data = unwrapResponse<Submission[]>(response);
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getErrorMessage(err) || "Unable to load answer sheets.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleViewPdf = async (submissionId: number) => {
    setActionError("");

    // Open the tab immediately to reduce popup-blocker issues.
    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setActionError(
        "Your browser blocked the PDF tab. Allow pop-ups for this site and try again."
      );
      return;
    }

    newTab.opener = null;

    try {
      const response = await apiRequest({
        url: `/mark-evaluation/uploads/${submissionId}/view`,
        method: "get",
      });

      const result = unwrapResponse<ViewUrlResponse>(response);

      if (!result?.view_url) {
        throw new Error("The server did not return a PDF viewing URL.");
      }

      newTab.location.href = result.view_url;
    } catch (err: any) {
      newTab.close();
      setActionError(getErrorMessage(err));
    }
  };

  
// const handleOpenEvaluation = async (
//   submission: Submission,
//   editExisting = false
// ) => {
//   setSelectedSubmission(submission);
//   setIsEditingEvaluation(editExisting);
//   setQuestions([]);
//   setMarks({});
//   setRemarks("");
//   setEvaluationError("");
//   setEvaluationSuccess("");
//   setQuestionsLoading(true);

//   try {
//     const questionsResponse = await apiRequest({
//       url: `/mark-evaluation/uploads/${submission.id}/questions`,
//       method: "get",
//     });

//     const questionsResult =
//       unwrapResponse<QuestionsResponse>(questionsResponse);

//     if (!questionsResult || !Array.isArray(questionsResult.questions)) {
//       throw new Error("Invalid question configuration returned by the server.");
//     }

//     setQuestions(questionsResult.questions);

//     const initialMarks: Record<number, string> = {};

//     questionsResult.questions.forEach((question) => {
//       initialMarks[question.question_no] = "";
//     });

//     if (editExisting) {
//       const evaluationResponse = await apiRequest({
//         url: `/mark-evaluation/uploads/${submission.id}/evaluation`,
//         method: "get",
//       });

//       const evaluation =
//         unwrapResponse<EvaluationResponse>(evaluationResponse);

//       if (!Array.isArray(evaluation.question_marks)) {
//         throw new Error("Saved evaluation marks were not returned correctly.");
//       }

//       evaluation.question_marks.forEach((item) => {
//         initialMarks[item.question_no] = String(item.marks);
//       });

//       setRemarks(evaluation.remarks ?? "");
//     }

//     setMarks(initialMarks);
//   } catch (err: any) {
//     setEvaluationError(getErrorMessage(err));
//   } finally {
//     setQuestionsLoading(false);
//   }
// };

const handleOpenEvaluation = async (
  submission: Submission,
  editExisting = false
) => {
  setSelectedSubmission(submission);
  setIsEditingEvaluation(editExisting);
  setQuestions([]);
  setMarks({});
  setRemarks("");
  setEvaluationError("");
  setEvaluationSuccess("");
  setQuestionsLoading(true);

  try {
    const questionsResponse = await apiRequest({
      url: `/mark-evaluation/uploads/${submission.id}/questions`,
      method: "get",
    });

    const questionsResult =
      unwrapResponse<QuestionsResponse>(questionsResponse);

    if (!questionsResult || !Array.isArray(questionsResult.questions)) {
      throw new Error("Invalid question configuration returned by the server.");
    }

    setQuestions(questionsResult.questions);

    const initialMarks: Record<number, string> = {};

    questionsResult.questions.forEach((question) => {
      initialMarks[question.question_no] = "";
    });

    if (editExisting) {
      const evaluationResponse = await apiRequest({
        url: `/mark-evaluation/uploads/${submission.id}/evaluation`,
        method: "get",
      });

      const evaluation =
        unwrapResponse<EvaluationResponse>(evaluationResponse);

      if (!Array.isArray(evaluation.question_marks)) {
        throw new Error("Saved evaluation marks were not returned correctly.");
      }

      evaluation.question_marks.forEach((item) => {
        initialMarks[item.question_no] = String(item.marks);
      });

      setRemarks(evaluation.remarks ?? "");
    }

    setMarks(initialMarks);
  } catch (err: any) {
    setEvaluationError(getErrorMessage(err));
  } finally {
    setQuestionsLoading(false);
  }
};


const handleSaveEvaluation = async () => {
  // Validate all question marks before saving.
  const invalidQuestion = questions.find((question) => {
    const value = marks[question.question_no];

    if (value === "" || value === undefined) {
      return true;
    }

    const numericValue = Number(value);

    return (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      numericValue > question.max_marks
    );
  });

  if (invalidQuestion) {
    setEvaluationError(
      `Question ${invalidQuestion.question_no} must have marks between 0 and ${invalidQuestion.max_marks}.`
    );
    return;
  }

  if (!selectedSubmission) return;

  // Keep the rest of your existing function below this line.
  setEvaluationError("");
  setEvaluationSuccess("");

    if (questions.length === 0) {
      setEvaluationError("No configured questions were returned.");
      return;
    }

    const missingQuestion = questions.find(
      (question) =>
        marks[question.question_no] === "" ||
        marks[question.question_no] === undefined
    );

    if (missingQuestion) {
      setEvaluationError(
        `Please enter marks for Question ${missingQuestion.question_no}.`
      );
      return;
    }

    for (const question of questions) {
      const value = Number(marks[question.question_no]);

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > question.max_marks
      ) {
        setEvaluationError(
          `Question ${question.question_no} must have marks between 0 and ${question.max_marks}.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      await apiRequest({
        url: `/mark-evaluation/uploads/${selectedSubmission.id}/evaluation`,
        method: "post",
        data: {
          question_marks: questions.map((question) => ({
            question_no: question.question_no,
            marks: Number(marks[question.question_no]),
          })),
          remarks: remarks.trim() || null,
        },
      });

      setEvaluationSuccess(
        isEditingEvaluation
            ? `Evaluation updated successfully for ${selectedSubmission.student_name || "student"} (${selectedSubmission.registration_no || "N/A"}).`
            : `Evaluation saved successfully for ${selectedSubmission.student_name || "student"} (${selectedSubmission.registration_no || "N/A"}).`
        );

      setSelectedSubmission(null);
      await loadSubmissions();
    } catch (err: any) {
      setEvaluationError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const enteredTotal = questions.reduce((total, question) => {
    const value = marks[question.question_no];
    return total + (value === "" || value === undefined ? 0 : Number(value));
  }, 0);

  const maximumTotal = questions.reduce(
    (total, question) => total + question.max_marks,
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Answer Sheet List
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        View uploaded answer sheets and their evaluation status.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            select
            size="small"
            label="Submission Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={() => void loadSubmissions()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setActionError("")}
        >
          {actionError}
        </Alert>
      )}

      {evaluationSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setEvaluationSuccess("")}
        >
          {evaluationSuccess}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: 2,
                border: "1px solid #DCE5E7",
                boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                overflowX: "auto",
            }}>
          <Table
            sx={{
                minWidth: 1100,
                "& tbody tr:nth-of-type(even)": {
                backgroundColor: "#F8FAFC",
                },
                "& tbody tr:hover": {
                backgroundColor: "#E0F2F1",
                },
                "& tbody td": {
                fontSize: "12px",
                padding: "12px",
                borderBottom: "1px solid #E2E8F0",
                },
                "& tbody td:first-of-type": {
                fontWeight: 700,
                color: "#263238",
                },
            }}
            >
            <TableHead>
                 <TableRow
                    sx={{
                    backgroundColor: "#E0F2F1",
                    "& th": {
                        color: "#004D40",
                        fontWeight: 800,
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        padding: "16px 12px",
                        borderBottom: "2px solid #009688",
                    },
                    }}
                >
                    <TableCell>Student Name</TableCell>
                    <TableCell>Registration Number</TableCell>
                    <TableCell>Program Name</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Course Name</TableCell>
                    <TableCell>Academic Year</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated By</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
                </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                    <TableCell>{row.student_name || "—"}</TableCell>
                    <TableCell>{row.registration_no || "—"}</TableCell>
                    <TableCell>{row.program_name || "—"}</TableCell>
                    <TableCell>{row.batch_name || "—"}</TableCell>
                    <TableCell>{row.semester_name || "—"}</TableCell>
                    <TableCell>{row.course_title || "—"}</TableCell>
                    <TableCell>{row.academic_year_name || "—"}</TableCell>
                    <TableCell>{row.status || "—"}</TableCell>
                    <TableCell>{row.last_updated_by_name || "—"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => void handleViewPdf(row.id)}
                      >
                        View PDF
                      </Button>

                      {row.status.toLowerCase() === "pending" ? (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => void handleOpenEvaluation(row)}
                        >
                            Evaluate
                        </Button>
                        ) : row.status.toLowerCase() === "evaluated" ? (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => void handleOpenEvaluation(row, true)}
                        >
                            Update Marks
                        </Button>
                        ) : null} 
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No answer sheets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={selectedSubmission !== null}
        onClose={() => {
          if (!saving) setSelectedSubmission(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEditingEvaluation ? "Update Evaluation" : "Evaluate Answer Sheet"}
          {selectedSubmission && ` — Submission ${selectedSubmission.id}`}
        </DialogTitle>

        <DialogContent dividers>
          {questionsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {evaluationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {evaluationError}
                </Alert>
              )}

              {selectedSubmission && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Student Name: {selectedSubmission.student_name || "—"} | Registration No:{" "}
                  {selectedSubmission.registration_no || "—"}
                </Typography>
              )}

              {questions.map((question) => (               
                <TextField
                    key={question.question_no}
                    fullWidth
                    type="number"
                    label={`Question ${question.question_no} (Maximum ${question.max_marks} marks)`}
                    value={marks[question.question_no] ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;

                        // Allow clearing the field while editing.
                        if (value !== "" && Number(value) < 0) {
                        setMarks((previous) => ({
                            ...previous,
                            [question.question_no]: value,
                        }));
                        return;
                        }

                        setMarks((previous) => ({
                        ...previous,
                        [question.question_no]: value,
                        }));
                    }}
                    error={
                        marks[question.question_no] !== "" &&
                        marks[question.question_no] !== undefined &&
                        (
                        !Number.isFinite(Number(marks[question.question_no])) ||
                        Number(marks[question.question_no]) < 0 ||
                        Number(marks[question.question_no]) > question.max_marks
                        )
                    }
                    helperText={
                        marks[question.question_no] === "" ||
                        marks[question.question_no] === undefined
                        ? `Enter marks from 0 to ${question.max_marks}`
                        : Number(marks[question.question_no]) < 0
                            ? "Negative marks are not allowed."
                            : Number(marks[question.question_no]) > question.max_marks
                            ? `Maximum allowed is ${question.max_marks} marks.`
                            : `Allowed: 0–${question.max_marks} marks`
                    }
                    inputProps={{
                        min: 0,
                        max: question.max_marks,
                        step: 0.5,
                    }}
                    sx={{ mb: 2 }}
                    required
                />

              ))}

              {questions.length > 0 && (
                <Typography fontWeight={600} sx={{ mb: 2 }}>
                  Total: {enteredTotal} / {maximumTotal}
                </Typography>
              )}

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Remarks (optional)"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setSelectedSubmission(null)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveEvaluation()}
            disabled={saving || questionsLoading || questions.length === 0}
          >
            {saving
                ? isEditingEvaluation
                    ? "Updating..."
                    : "Saving..."
                : isEditingEvaluation
                    ? "Update Evaluation"
                    : "Save Evaluation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
