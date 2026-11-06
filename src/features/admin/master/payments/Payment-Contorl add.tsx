
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
} from "@mui/material";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  useForm,
  Controller,
} from "react-hook-form";

import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import CardComponent from "../../../../components/card/Card";

import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";

import { useAlert } from "../../../../context/AlertContext";
import { useGlobalError } from "../../../../context/ErrorContext";

import CustomSelect from "../../../../components/inputs/customtext/CustomSelect";
import CustomCheckboxInput from "../../../../components/inputs/customtext/CustomCheckboxInput";

/* ---------------- TYPES ---------------- */

interface FormValues {
  program_id: string;
  batch: string;
  admission_year: string;
  semester: string;
  fees_start_date: string;
  fees_end_date: string;
  enabled: boolean;
}

/* ---------------- DEFAULT VALUES ---------------- */

const defaultValues: FormValues = {
  program_id: "",
  batch: "",
  admission_year: "",
  semester: "",
  fees_start_date: "",
  fees_end_date: "",
  enabled: true,
};

/* ---------------- STATIC DROPDOWN LISTS ---------------- */

const BATCH_LIST = [
  { label: "January", value: "January" },
  { label: "July", value: "July" },
];

const SEMESTER_LIST = [
  { label: "SEMESTER 1", value: "Semester 1" },
  { label: "SEMESTER 2", value: "Semester 2" },
  { label: "SEMESTER 3", value: "Semester 3" },
  { label: "SEMESTER 4", value: "Semester 4" },
  { label: "SEMESTER 5", value: "Semester 5" },
  { label: "SEMESTER 6", value: "Semester 6" },
  { label: "SEMESTER 7", value: "Semester 7" },
  { label: "SEMESTER 8", value: "Semester 8" },
];

/* ---------------- VALIDATION ---------------- */

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
  program_id: Yup.string().required("Program is required"),

  batch: Yup.string().required("Batch is required"),

  admission_year: Yup.string().required("Admission year is required"),

  semester: Yup.string().required("Semester is required"),

  fees_start_date: Yup.string().required(
    "Fees start date is required"
  ),

  fees_end_date: Yup.string()
    .required("Fees end date is required")
    .test(
      "end-date-validation",
      "Fees end date must be after or equal to fees start date",
      function (value) {
        const { fees_start_date } = this.parent;

        if (!value || !fees_start_date) return true;

        return value >= fees_start_date;
      }
    ),

  enabled: Yup.boolean().required(),
});

/* ---------------- COMPONENT ---------------- */

export default function PaymentWorkflowAdd() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const location = useLocation();

  const rowData = location.state;

  const { showAlert, showConfirm } = useAlert();

  const { clearError } = useGlobalError();

  const [initialData, setInitialData] =
    useState<FormValues>(defaultValues);

  const [programOptions, setProgramOptions] = useState<any[]>([]);

  const [yearOptions, setYearOptions] = useState<any[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* ---------------- LOAD DROPDOWNS ---------------- */

  useEffect(() => {
    clearError();

    loadDropdowns();

    if (rowData) {
      fetchWorkflowById();
    }
  }, [rowData]);

  const loadDropdowns = async () => {
    try {
      const [programRes, yearRes] = await Promise.all([
        apiRequest({
          url: ApiRoutes.GETPROGRAMLIST,
          method: "get",
        }),

        apiRequest({
          url: ApiRoutes.ACADEMICYEARLIST,
          method: "get",
        }),
      ]);

      setProgramOptions(
        (programRes || []).map((p: any) => ({
          label: p.programe,
          value: String(p.id),
        }))
      );

      setYearOptions(
        (yearRes || []).map((y: any) => ({
          label: y.year_code,
          value: y.year_code,
        }))
      );
    } catch {
      showAlert("Failed to load dropdown data", "error");
    }
  };

  /* ---------------- FETCH EDIT DATA ---------------- */

  const fetchWorkflowById = async () => {
    try {
      if (!rowData) return;

      const {
        program_id,
        batch,
        admission_year,
        semester,
      } = rowData;

      const res = await apiRequest({
        url: `${ApiRoutes.PAYMENTCONTROL}/${program_id}/pending-payment-workflow`,
        method: "get",
        params: {
          batch,
          admission_year,
          semester,
        },
      });

      const data: FormValues = {
        program_id: String(program_id),
        batch: res.batch || batch || "",
        admission_year: res.admission_year || admission_year || "",
        semester: res.semester || semester || "",

        fees_start_date: res.fees_start_date
          ? String(res.fees_start_date).substring(0, 10)
          : "",

        fees_end_date: res.fees_end_date
          ? String(res.fees_end_date).substring(0, 10)
          : "",

        enabled: res.enabled ?? true,
      };

      setInitialData(data);

      reset(data);
    } catch {
      showAlert("Failed to load workflow data", "error");
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = async (values: FormValues) => {
    try {
      const programId = isEditMode
        ? rowData?.program_id || values.program_id
        : values.program_id;

      await apiRequest({
        url: `${ApiRoutes.PAYMENTCONTROL}/${programId}/pending-payment-workflow`,
        method: isEditMode ? "put" : "post",
        data: {
          batch: values.batch,
          admission_year: values.admission_year,
          semester: values.semester,
          fees_start_date: values.fees_start_date,
          fees_end_date: values.fees_end_date,
          enabled: values.enabled,
        },
      });

      showAlert(
        isEditMode
          ? "Workflow updated successfully"
          : "Workflow created successfully",
        "success"
      );

      navigate("/payment-control/list");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to save workflow";

      showAlert(errorMessage, "error");
    }
  };

  /* ---------------- RESET ---------------- */

  const handleReset = () => {
    reset(initialData);
  };

  /* ---------------- BACK ---------------- */

  const handleBack = () => {
    if (isDirty) {
      showConfirm(
        "You have unsaved changes. Are you sure you want to leave?",
        () => navigate("/payment-control/list"),
        () => {}
      );
    } else {
      navigate("/payment-control/list");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box p={3}>
      <CardComponent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>

            {/* Program */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="program_id"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Program"
                    options={programOptions}
                    field={field}
                  />
                )}
              />
            </Grid>

            {/* Batch */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="batch"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Batch"
                    options={BATCH_LIST}
                    field={field}
                  />
                )}
              />
            </Grid>

            {/* Admission Year */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="admission_year"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Admission Year"
                    options={yearOptions}
                    field={field}
                  />
                )}
              />
            </Grid>

            {/* Semester */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Semester"
                    options={SEMESTER_LIST}
                    field={field}
                  />
                )}
              />
            </Grid>

            {/* Fees Start Date */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="fees_start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fees Start Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.fees_start_date}
                    helperText={errors.fees_start_date?.message}
                  />
                )}
              />
            </Grid>

            {/* Fees End Date */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="fees_end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fees End Date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: undefined,
                    }}
                    error={!!errors.fees_end_date}
                    helperText={errors.fees_end_date?.message}
                  />
                )}
              />
            </Grid>

            {/* Enabled */}

            <Grid size={{ xs: 12 }}>
              <Controller
                name="enabled"
                control={control}
                render={({ field }) => (
                  <CustomCheckboxInput
                    label="Enable Workflow"
                    field={field}
                  />
                )}
              />
            </Grid>

          </Grid>

          {/* Buttons */}

          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            mt={4}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="contained"
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </Box>
        </form>
      </CardComponent>
    </Box>
  );
}
