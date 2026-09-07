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
import CustomNumberInput from "../../../../components/inputs/customtext/CustomNumberInput";

import apiClient from "../../../../services/ApiClient";

/* -------------------------------- types -------------------------------- */

interface FormValues {
  programe_id: number;
  semester: string;

  application_fee: number;
  admission_fee: number;
  tuition_fee: number;
  exam_fee: number;
  lms_fee: number;
  lab_fee: number;
  total_fee: number;
}

/* ---------------------------- default values ---------------------------- */

const defaultValues: FormValues = {
  programe_id: 0,
  semester: "",

  application_fee: 0,
  admission_fee: 0,
  tuition_fee: 0,
  exam_fee: 0,
  lms_fee: 0,
  lab_fee: 0,
  total_fee: 0,
};

/* ----------------------------- validation ------------------------------ */

const schema = Yup.object().shape({
  programe_id: Yup.number()
    .moreThan(0, "Program is required")
    .required("Program is required"),

  semester: Yup.string()
    .required("Semester is required"),

  application_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Application Fee is required"),

  admission_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Admission Fee is required"),

  tuition_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Tuition Fee is required"),

  exam_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Exam Fee is required"),

  lms_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("LMS Fee is required"),

  lab_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Lab Fee is required"),

  total_fee: Yup.number()
    .min(0, "Invalid amount")
    .required("Total Fee is required"),
});

/* ----------------------------- component -------------------------------- */

export default function FeeDetailAdd() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showAlert, showConfirm } = useAlert();
  const { loading } = useLoader();
  const { clearError } = useGlobalError();

  const [initialData, setInitialData] =
    useState<FormValues | null>(null);

  const [programs, setPrograms] = useState<
    { value: string; label: string }[]
  >([]);

  const [semesters, setSemesters] = useState<
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

  const selectedProgramId = watch("programe_id");

  const applicationFee = watch("application_fee") || 0;
  const admissionFee = watch("admission_fee") || 0;
  const tuitionFee = watch("tuition_fee") || 0;
  const examFee = watch("exam_fee") || 0;
  const lmsFee = watch("lms_fee") || 0;
  const labFee = watch("lab_fee") || 0;

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
            label: `${p.programe}${
              p.programe_code
                ? ` (${p.programe_code})`
                : ""
            }`,
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

    fetchPrograms();
  }, []);

  /* ---------------------- fetch semesters ---------------------- */

  useEffect(() => {
    if (!selectedProgramId) {
      setSemesters([]);
      setValue("semester", "");
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
            value: String(
              s.semester_name ||
              s.semester_no
            ),
            label:
              s.semester_name ||
              `Semester ${s.semester_no}`,
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

  /* ---------------------- calculate total ---------------------- */

  useEffect(() => {
    const total =
      Number(applicationFee) +
      Number(admissionFee) +
      Number(tuitionFee) +
      Number(examFee) +
      Number(lmsFee) +
      Number(labFee);

    setValue("total_fee", total, {
      shouldDirty: true,
    });
  }, [
    applicationFee,
    admissionFee,
    tuitionFee,
    examFee,
    lmsFee,
    labFee,
    setValue,
  ]);

  /* --------------------------- edit mode --------------------------- */

  useEffect(() => {
    if (!id) return;

    const fetchFeeDetail = async () => {
      try {
        const res = await apiClient.get(
          `${ApiRoutes.FEEDETAILGETBYID}/${Number(id)}`
        );

        const data = res.data;

        const formatted: FormValues = {
          programe_id: Number(
            data.programe_id
          ),

          semester:
            data.semester || "",

          application_fee: Number(
            data.application_fee || 0
          ),

          admission_fee: Number(
            data.admission_fee || 0
          ),

          tuition_fee: Number(
            data.tuition_fee || 0
          ),

          exam_fee: Number(
            data.exam_fee || 0
          ),

          lms_fee: Number(
            data.lms_fee || 0
          ),

          lab_fee: Number(
            data.lab_fee || 0
          ),

          total_fee: Number(
            data.total_fee || 0
          ),
        };

        setInitialData(formatted);
        reset(formatted);
      } catch (error: any) {
        showAlert(
          error?.response?.data?.detail ||
          "Failed to load fee details",
          "error"
        );
      }
    };

    fetchFeeDetail();
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

  /* ----------------------------- submit ----------------------------- */

  const onSubmit = async (
    data: FormValues
  ) => {
    try {
      const payload = {
        programe_id: Number(
          data.programe_id
        ),

        semester: data.semester,

        application_fee: String(
          data.application_fee || 0
        ),

        admission_fee: String(
          data.admission_fee || 0
        ),

        tuition_fee: String(
          data.tuition_fee || 0
        ),

        exam_fee: String(
          data.exam_fee || 0
        ),

        lms_fee: String(
          data.lms_fee || 0
        ),

        lab_fee: String(
          data.lab_fee || 0
        ),

        total_fee: String(
          data.total_fee || 0
        ),
      };

      if (id) {
        await apiRequest({
          url: `${ApiRoutes.FEEDETAILUPDATE}/${Number(id)}`,
          method: "put",
          data: payload,
        });

        showAlert(
          "Fee details updated successfully",
          "success"
        );
      } else {
        await apiRequest({
          url: ApiRoutes.FEEDETAILCREATE,
          method: "post",
          data: payload,
        });

        showAlert(
          "Fee details created successfully",
          "success"
        );
      }

      navigate("/fee-detail/list");
    } catch (error: any) {
      showAlert(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to save fee details",
        "error"
      );
    }
  };

  /* -------------------------------- UI -------------------------------- */

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardComponent sx={{ p: 4 }}>
          <Grid container spacing={3}>

            {/* Program */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="programe_id"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Program"
                    field={field}
                    options={programs}
                    helperText={
                      errors.programe_id?.message
                    }
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
                    field={field}
                    options={semesters}
                    disabled={!selectedProgramId}
                    helperText={
                      errors.semester?.message
                    }
                  />
                )}
              />
            </Grid>

            {/* Application Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="application_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Application Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.application_fee
                    }
                    helperText={
                      errors.application_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* Admission Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="admission_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Admission Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.admission_fee
                    }
                    helperText={
                      errors.admission_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* Tuition Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="tuition_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Tuition Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.tuition_fee
                    }
                    helperText={
                      errors.tuition_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* Exam Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="exam_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Exam Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.exam_fee
                    }
                    helperText={
                      errors.exam_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* LMS Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="lms_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="LMS Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.lms_fee
                    }
                    helperText={
                      errors.lms_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* Lab Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="lab_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Lab Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.lab_fee
                    }
                    helperText={
                      errors.lab_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

            {/* Total Fee */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="total_fee"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    label="Total Fee"
                    value={
                      field.value ?? ""
                    }
                    error={
                      !!errors.total_fee
                    }
                    helperText={
                      errors.total_fee
                        ?.message
                    }
                    onChange={(val) =>
                      field.onChange(val)
                    }
                  />
                )}
              />
            </Grid>

          </Grid>

          {/* Buttons */}

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
              {loading ? (
                <CircularProgress size={20} />
              ) : id ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </CardComponent>
      </form>
    </Box>
  );
}