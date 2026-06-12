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
import apiClient from "../../../../services/ApiClient";
// import CustomInputText from "../../../../components/inputs/customtext/CustomInputText";
// import CustomNumberInput from "../../../../components/inputs/customtext/CustomNumberInput";

interface FormValues {
    programe_id: number;
    semester_id: number;
    course_code?: number;
    // regulation_year: string;
    // program_pattern: string;
    // program_pattern_no: number;
}

const defaultValues: FormValues = {
    programe_id: 0,
    semester_id: 0,
    course_code:0,
    // regulation_year: "",
    // program_pattern: "",
    // program_pattern_no: 0,
};

const schema = Yup.object().shape({
    programe_id: Yup.number().required("Program is required"),
    semester_id: Yup.number().required("Semester is required"),
    course_code: Yup.number().required("Course Code is required"),
    // regulation_year: Yup.string().required("Regulation Year is required"),
    // program_pattern: Yup.string().required("Program Pattern is required"),
    // program_pattern_no: Yup.number()
    //     .min(0, "Must be 0 or greater")
    //     .required("Program Pattern No is required"),
});

export default function SchemesAdd() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showAlert, showConfirm } = useAlert();
    const { loading } = useLoader();
    const { clearError } = useGlobalError();
    const [initialData, setInitialData] = useState<FormValues | null>(null);


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

    const [programs, setPrograms] = useState<{ value: string; label: string }[]>([]);
    const selectedProgramId = watch("programe_id");
    const [semesters, setSemesters] = useState<{ value: string; label: string }[]>([]);
    const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);

        useEffect(() => {
        if (!selectedProgramId) {
            setCourses([]);
            setValue("course_code", 0);
            return;
        }

        const fetchCourses = async () => {
            try {
                const res = await apiClient.get(
                    `${ApiRoutes.PROGRAMFETCH}/${selectedProgramId}/courses`
                );

                const coursesList =
                    res.data || [];

                const mapped = coursesList.map(
                    (s: any) => ({
                        value: String(s.course_code),
                        label: `${s.course_title}`,
                    })
                );

                setCourses(mapped);

            } catch {
                showAlert(
                    "Failed to load courses list",
                    "error"
                );
            }
        };

        fetchCourses();

    }, [selectedProgramId]);
    
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

    useEffect(() => {
        clearError();

        const fetchData = async () => {
            try {
                const res = await apiClient.get(ApiRoutes.GETPROGRAMLIST);

                const mappedPrograms = (res.data || []).map((p: any) => ({
                    value: String(p.id),          // form value
                    label: p.programe,            // visible text
                }));

                setPrograms(mappedPrograms);
            } catch (error) {
                showAlert("Failed to load program list", "error");
            }
        };

        fetchData();
    }, []);


    // Load data if editing
    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const res = await apiRequest({
                    url: `${ApiRoutes.SCHEMES}/${id}`,
                    method: "get",
                });

                const data = res?.data || res;
                setInitialData(data);
                reset(data);
            } catch (err) {
                console.error(err);
                showAlert("Failed to load scheme data", "error");
            }
        })();
    }, [id, reset, showAlert]);

    const handleBack = () => {
        if (isDirty) {
            showConfirm(
                "You have unsaved changes. Your changes will be lost if you continue.",
                () => navigate(-1),
                () => { }
            );
        } else {
            navigate(-1);
        }
    };

    const handleReset = () => {
        if (id && initialData) {
            reset(initialData);
            showAlert("Restored original data", "info");
        } else {
            reset(defaultValues);
            showAlert("Form cleared", "info");
        }
    };

    const onSubmit = async (formData: FormValues) => {
        try {
            const payload = {
                ...formData,
                programe_id: Number(formData.programe_id),
                // program_pattern_no: Number(formData.program_pattern_no),
            };

            if (id) {
                await apiRequest({
                    url: `${ApiRoutes.SCHEMES}/${id}`,
                    method: "put",
                    data: payload,
                });
                showAlert("Scheme updated", "success");
            } else {
                await apiRequest({
                    url: ApiRoutes.SCHEMES,
                    method: "post",
                    data: payload,
                });
                showAlert("Scheme created", "success");
            }
            clearError();
            navigate("/schemes/list");
        } catch (err: any) {
            console.error(err);
            showAlert(err.detail || "Failed to save", "error");
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardComponent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        {/* Program Dropdown */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="programe_id"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        label="Program"
                                        field={field}
                                        options={programs}
                                        error={errors.programe_id}
                                        helperText={errors.programe_id?.message}
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
                                        // error={errors.semester_id}
                                        helperText={errors.semester_id?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="course_code"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        label="Course"
                                        field={field}
                                        options={courses}
                                        helperText={errors.course_code?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Regulation Year Input */}
                        {/* <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="regulation_year"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputText
                                        label="Regulation Year"
                                        field={field}
                                        error={!!errors.regulation_year}
                                        helperText={errors.regulation_year?.message}
                                    />
                                )}
                            />
                        </Grid> */}


                        {/* Program Pattern Input */}
                        {/* <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="program_pattern"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputText
                                        label="Program Pattern"
                                        field={field}
                                        error={!!errors.program_pattern}
                                        helperText={errors.program_pattern?.message}
                                    />
                                )}
                            />
                        </Grid> */}


                        {/* Program Pattern No Input */}
                        {/* <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="program_pattern_no"
                                control={control}
                                render={({ field }) => (
                                    <CustomNumberInput
                                        label="Program Pattern No"
                                        value={field.value ?? ""}
                                        error={!!errors.program_pattern_no}
                                        helperText={errors.program_pattern_no?.message}
                                        onChange={(val) => field.onChange(val)}
                                    />
                                )}
                            />
                        </Grid> */}
                    </Grid>

                    {/* Buttons */}
                    <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={handleBack}>
                            Back
                        </Button>

                        <Button variant="outlined" color="error" onClick={handleReset}>
                            Reset
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} /> : id ? "Update" : "Submit"}
                        </Button>
                    </Box>
                </CardComponent>
            </form>
        </Box>
    );
}
