import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../../../context/AlertContext";
import { useLoader } from "../../../../context/LoaderContext";
import { useGlobalError } from "../../../../context/ErrorContext";
import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";

import CardComponent from "../../../../components/card/Card";
import CustomSelect from "../../../../components/inputs/customtext/CustomSelect";
import CustomInputText from "../../../../components/inputs/customtext/CustomInputText";
import CustomNumberInput from "../../../../components/inputs/customtext/CustomNumberInput";
import apiClient from "../../../../services/ApiClient";

/* -------------------------------- types -------------------------------- */

interface FormValues {
  program_id: number;
  semester_id: number;

  course_category: string;
  course_code: string;
  course_title: string;
  credits: number;
  regulation_pattern: string;
}

const defaultValues: FormValues = {
  program_id: 0,
  semester_id: 0,

  course_category: "",
  course_code: "",
  course_title: "",
  credits: 0,
  regulation_pattern: "",
};

/* ----------------------------- validation ------------------------------- */

const schema = Yup.object().shape({
  program_id: Yup.number().required("Program is required"),
  semester_id: Yup.number().required("Semester is required"),

  course_category: Yup.string().required("Course Category is required"),
  course_code: Yup.string().required("Course Code is required"),
  course_title: Yup.string().required("Course Title is required"),
  credits: Yup.number().min(0).required("Credits are required"),
  regulation_pattern: Yup.string().required("Regulation Pattern is required"),
});

/* ----------------------------- component -------------------------------- */

export default function CourseAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showAlert, showConfirm } = useAlert();
  const { loading } = useLoader();
  const { clearError } = useGlobalError();

  const [initialData, setInitialData] = useState<FormValues | null>(null);

  const [programs, setPrograms] = useState<
    { value: string; label: string }[]
  >([]);

  const [semesters, setSemesters] = useState<
    { value: string; label: string }[]
  >([]);

  const [courseCategories, setCourseCategories] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const selectedProgramId = watch("program_id");

  /* ------------------------- fetch programs ------------------------- */

  useEffect(() => {
    clearError();

    const fetchPrograms = async () => {
      try {
        const res = await apiClient.get(
          ApiRoutes.GETPROGRAMLIST
        );

        const mapped = (res.data || []).map(
          (p: any) => ({
            value: String(p.id),
            label: p.programe,
          })
        );

        setPrograms(mapped);
      } catch {
        showAlert(
          "Failed to load programs list",
          "error"
        );
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await apiClient.get(
          ApiRoutes.COURSECATEGORYLIST
        );

        const mapped = (res.data || []).map(
          (c: any) => ({
            value: String(c.id),
            label: `${c.category_name} (${c.category_code})`,
          })
        );

        setCourseCategories(mapped);
      } catch {
        showAlert(
          "Failed to load course categories list",
          "error"
        );
      }
    };

    fetchPrograms();
    fetchCategories();

  }, []);

  /* ---------------------- fetch semesters by program ---------------------- */

  useEffect(() => {
    if (!selectedProgramId) {
      setSemesters([]);
      setValue("semester_id", 0);
      return;
    }

    const fetchSemesters = async () => {
      try {
          const res = await apiClient.get(
            `${ApiRoutes.PROGRAMFETCH}/${selectedProgramId}/semesters`
          );

          const semesterList =
            res.data?.semesters || [];

          const mapped = semesterList.map(
            (s: any) => ({
              value: String(s.semester_no),
              label: `${s.semester_name}`,
            })
          );

          setSemesters(mapped);

      } catch {
          showAlert(
            "Failed to load semesters list",
            "error"
          );
      }
    };

    fetchSemesters();

  }, [selectedProgramId]);

  /* --------------------------- edit mode --------------------------- */

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const res = await apiClient.get(
          `${ApiRoutes.COURSES}/${Number(id)}`
        );

        const data = res.data;

        const formatted: FormValues = {
          program_id: data.program_id,
          semester_id: data.semester_id,

          course_category: data.course_category,
          course_code: data.course_code,
          course_title: data.course_title,
          credits: data.credits,
          regulation_pattern:
            data.regulation_pattern,
        };

        setInitialData(formatted);
        reset(formatted);

      } catch (error: any) {
        showAlert(
          error?.response?.data?.detail ||
          "Failed to load course details",
          "error"
        );
      }
    };

    fetchCourse();

  }, [id]);

  /* ----------------------------- handlers ----------------------------- */

  const handleBack = () => {
    if (isDirty) {
      showConfirm(
        "You have unsaved changes. Your changes will be lost.",
        () => navigate(-1),
        () => {}
      );
    } else {
      navigate(-1);
    }
  };

  const handleReset = () => {
    if (id && initialData) {
      reset(initialData);
      showAlert(
        "Original values restored",
        "info"
      );
    } else {
      reset(defaultValues);
      showAlert(
        "Form cleared",
        "info"
      );
    }
  };

  const onSubmit = async (
    data: FormValues
  ) => {
    try {
      const payload = {
        program_id: Number(data.program_id),
        semester_id: Number(data.semester_id),

        course_category_id: data.course_category,
        course_code: data.course_code,
        course_title: data.course_title,
        credits: Number(data.credits),
        regulation_pattern:
          data.regulation_pattern,
      };

      if (id) {
        await apiRequest({
          url: `${ApiRoutes.COURSES}/${Number(id)}`,
          method: "put",
          data: payload,
        });

        showAlert(
          "Course updated successfully",
          "success"
        );

      } else {
        await apiRequest({
          url: ApiRoutes.COURSES,
          method: "post",
          data: payload,
        });

        showAlert(
          "Course created successfully",
          "success"
        );
      }

      navigate("/courses/list");

    } catch (error: any) {
      showAlert(
        error?.detail ||
        "Failed to save course",
        "error"
      );
    }
  };

  /* ------------------------------- UI ------------------------------- */

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardComponent sx={{ p: 4 }}>
          <Grid container spacing={3}>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="program_id"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Program"
                    field={field}
                    options={programs}
                    helperText={
                      errors.program_id?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="semester_id"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Semester"
                    field={field}
                    options={semesters}
                    disabled={!selectedProgramId}
                    helperText={
                      errors.semester_id?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="course_category"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Course Category"
                    field={field}
                    options={courseCategories}
                    helperText={
                      errors.course_category?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="course_code"
                control={control}
                render={({ field }) => (
                  <CustomInputText
                    label="Course Code"
                    field={field}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="course_title"
                control={control}
                render={({ field }) => (
                  <CustomInputText
                    label="Course Title"
                    field={field}
                    error={
                      !!errors.course_title
                    }
                    helperText={
                      errors.course_title
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="credits"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Credits"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.credits
                    }
                    helperText={
                      errors.credits
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="regulation_pattern"
                control={control}
                render={({ field }) => (
                  <CustomInputText
                    label="Regulation Pattern"
                    field={field}
                    error={
                      !!errors.regulation_pattern
                    }
                    helperText={
                      errors
                        .regulation_pattern
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

          </Grid>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 4,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={handleBack}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading}
            >
              {loading
                ? (
                  <CircularProgress
                    size={20}
                  />
                )
                : id
                ? "Update"
                : "Submit"}
            </Button>
          </Box>

        </CardComponent>
      </form>
    </Box>
  );
}