import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
} from "@mui/material";
import {
    Controller,
    useForm,
} from "react-hook-form";
import {
    yupResolver,
} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import dayjs from "dayjs";

import CardComponent from "../../../../components/card/Card";
import CustomSelect from "../../../../components/inputs/customtext/CustomSelect";
import CustomDateInput from "../../../../components/inputs/customtext/CustomDateInput";

import apiClient from "../../../../services/ApiClient";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import { apiRequest } from "../../../../utils/ApiRequest";

import { useAlert } from "../../../../context/AlertContext";
import { useLoader } from "../../../../context/LoaderContext";
import { useGlobalError } from "../../../../context/ErrorContext";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface FormValues {
    program_id: string;
    batch: string;
    semester: string;

    Duefrmdate: Date | null;
    Duetodate: Date | null;

    course_start_date: Date | null;
    course_end_date: Date | null;

    exam_start_date: Date | null;
    exam_end_date: Date | null;
}

/* -------------------------------------------------------------------------- */
/*                              DEFAULT VALUES                                */
/* -------------------------------------------------------------------------- */

const defaultValues: FormValues = {
    program_id: "",
    batch: "",
    semester: "",

    Duefrmdate: null,
    Duetodate: null,

    course_start_date: null,
    course_end_date: null,

    exam_start_date: null,
    exam_end_date: null,
};

/* -------------------------------------------------------------------------- */
/*                              BATCH OPTIONS                                 */
/* -------------------------------------------------------------------------- */

const batchOptions = [
    {
        label: "Batch I - january-1",
        value: "Batch I - january-1",
    },
    {
        label: "Batch I - january-2",
        value: "Batch I - january-2",
    },
    {
        label: "Batch I - july-1",
        value: "Batch I - july-1",
    },
    {
        label: "Batch I - july-2",
        value: "Batch I - july-2",
    },
    {
        label: "Batch I - july-3",
        value: "Batch I - july-3",
    },
    {
        label: "Batch I - july-4",
        value: "Batch I - july-4",
    },
    {
        label: "Batch I - july-5",
        value: "Batch I - july-5",
    },
    {
        label: "Batch I - july-6",
        value: "Batch I - july-6",
    },
    {
        label: "Batch I - july-7",
        value: "Batch I - july-7",
    },
    {
        label: "Batch I - july-8",
        value: "Batch I - july-8",
    },

    {
        label: "Batch II - january-1",
        value: "Batch II - january-1",
    },
    {
        label: "Batch II - january-2",
        value: "Batch II - january-2",
    },
    {
        label: "Batch II - january-3",
        value: "Batch II - january-3",
    },
    {
        label: "Batch II - january-4",
        value: "Batch II - january-4",
    },
    {
        label: "Batch II - january-5",
        value: "Batch II - january-5",
    },
    {
        label: "Batch II - january-6",
        value: "Batch II - january-6",
    },
    {
        label: "Batch II - january-7",
        value: "Batch II - january-7",
    },
    {
        label: "Batch II - january-8",
        value: "Batch II - january-8",
    },
    {
        label: "Batch II - july-1",
        value: "Batch II - july-1",
    },
    {
        label: "Batch II - july-2",
        value: "Batch II - july-2",
    },

    {
        label: "Batch III - july-1",
        value: "Batch III - july-1",
    },
    {
        label: "Batch III - july-2",
        value: "Batch III - july-2",
    },
    {
        label: "Batch III - july-3",
        value: "Batch III - july-3",
    },
    {
        label: "Batch III - july-4",
        value: "Batch III - july-4",
    },
    {
        label: "Batch III - july-5",
        value: "Batch III - july-5",
    },
    {
        label: "Batch III - july-6",
        value: "Batch III - july-6",
    },
    {
        label: "Batch III - july-7",
        value: "Batch III - july-7",
    },
    {
        label: "Batch III - july-8",
        value: "Batch III - july-8",
    },
];

/* -------------------------------------------------------------------------- */
/*                            SEMESTER OPTIONS                                */
/* -------------------------------------------------------------------------- */

const semesterOptions = [
    {
        label: "Semester 1",
        value: "Semester 1",
    },
    {
        label: "Semester 2",
        value: "Semester 2",
    },
    {
        label: "Semester 3",
        value: "Semester 3",
    },
    {
        label: "Semester 4",
        value: "Semester 4",
    },
    {
        label: "Semester 5",
        value: "Semester 5",
    },
    {
        label: "Semester 6",
        value: "Semester 6",
    },
    {
        label: "Semester 7",
        value: "Semester 7",
    },
    {
        label: "Semester 8",
        value: "Semester 8",
    },
];

/* -------------------------------------------------------------------------- */
/*                              VALIDATION                                    */
/* -------------------------------------------------------------------------- */

const schema: Yup.ObjectSchema<FormValues> =
    Yup.object({
        program_id: Yup.string()
            .required("Program is required"),

        batch: Yup.string()
            .trim()
            .required("Batch is required"),

        semester: Yup.string()
            .trim()
            .required("Semester is required"),

        Duefrmdate: Yup.date()
            .nullable()
            .required("Due From Date is required"),

        Duetodate: Yup.date()
            .nullable()
            .required("Due To Date is required"),

        course_start_date: Yup.date()
            .nullable()
            .required("Course Start Date is required"),

        course_end_date: Yup.date()
            .nullable()
            .required("Course End Date is required")
            .test(
                "course-end-after-start",
                "Course End Date must be after Course Start Date",
                function (value) {
                    const {
                        course_start_date,
                    } = this.parent as FormValues;

                    if (
                        !value ||
                        !course_start_date
                    ) {
                        return true;
                    }

                    return (
                        new Date(value) >=
                        new Date(course_start_date)
                    );
                }
            ),

        exam_start_date: Yup.date()
            .nullable()
            .required("Exam Start Date is required"),

        exam_end_date: Yup.date()
            .nullable()
            .required("Exam End Date is required")
            .test(
                "exam-end-after-start",
                "Exam End Date must be after Exam Start Date",
                function (value) {
                    const {
                        exam_start_date,
                    } = this.parent as FormValues;

                    if (
                        !value ||
                        !exam_start_date
                    ) {
                        return true;
                    }

                    return (
                        new Date(value) >=
                        new Date(exam_start_date)
                    );
                }
            ),
    });

/* -------------------------------------------------------------------------- */
/*                              DATE HELPER                                   */
/* -------------------------------------------------------------------------- */

const formatApiDate = (
    date: string | null | undefined
): Date | null => {
    if (!date) {
        return null;
    }

    const parsed = dayjs(date);

    return parsed.isValid()
        ? parsed.toDate()
        : null;
};

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

export default function ProgramBatchSemesterAdd() {
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        showAlert,
        showConfirm,
    } = useAlert();

    const { loading } = useLoader();

    const { clearError } =
        useGlobalError();

    /* ------------------------------------------------------------------------ */
    /*                              STATE                                       */
    /* ------------------------------------------------------------------------ */

    const [
        programs,
        setPrograms,
    ] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    const [
        initialData,
        setInitialData,
    ] = useState<FormValues | null>(
        null
    );

    /* ------------------------------------------------------------------------ */
    /*                              FORM                                        */
    /* ------------------------------------------------------------------------ */

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: {
            errors,
            isDirty,
        },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues,
    });
    /* ------------------------------------------------------------------------ */
    /*                              WATCH                                       */
    /* ------------------------------------------------------------------------ */

    const courseStartDate = watch(
        "course_start_date"
    );

    /* ------------------------------------------------------------------------ */
    /*                           FETCH PROGRAMS                                  */
    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        clearError();

        const fetchPrograms = async () => {
            try {
                const response =
                    await apiClient.get(
                        ApiRoutes.GETPROGRAMLIST
                    );

                console.log(
                    "Program API Response:",
                    response.data
                );

                const result =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.data || [];

                const mapped =
                    result.map((p: any) => ({
                        value: String(p.id),

                        label: `${p.programe}${p.programe_code
                                ? ` (${p.programe_code})`
                                : ""
                            }`,
                    }));

                setPrograms(mapped);
            } catch (error) {
                console.error(
                    "Failed to load programs:",
                    error
                );

                setPrograms([]);

                showAlert(
                    "Failed to load programs list",
                    "error"
                );
            }
        };

        fetchPrograms();
    }, []);

    /* ------------------------------------------------------------------------ */
    /*                    AUTO CALCULATE DUE DATES                              */
    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        if (!courseStartDate) {
            return;
        }

        const startDate =
            dayjs(courseStartDate);

        if (!startDate.isValid()) {
            return;
        }

        /*
         * Due From Date = Course Start Date
         */

        setValue(
            "Duefrmdate",
            startDate.toDate(),
            {
                shouldDirty: true,
            }
        );

        /*
         * Due To Date = Course Start Date + 45 Days
         */

        const dueDate =
            startDate.add(45, "day");

        setValue(
            "Duetodate",
            dueDate.toDate(),
            {
                shouldDirty: true,
            }
        );
    }, [
        courseStartDate,
        setValue,
    ]);

    /* ------------------------------------------------------------------------ */
    /*                         FETCH EDIT DATA                                  */
    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchData = async () => {
            try {
                const response =
                    await apiClient.get(
                        `${ApiRoutes.PROGRAMBATCHSEMESTERGETBYID}/${Number(
                            id
                        )}`
                    );

                console.log(
                    "Program Batch Semester Response:",
                    response.data
                );

                const data =
                    response?.data?.data ??
                    response?.data;

                if (!data) {
                    showAlert(
                        "Program batch semester data not found",
                        "error"
                    );

                    return;
                }

                const formatted: FormValues = {
                    program_id: String(
                        data.program_id ?? ""
                    ),

                    batch:
                        data.batch ?? "",

                    semester:
                        data.semester ?? "",

                    Duefrmdate:
                        formatApiDate(
                            data.Duefrmdate
                        ),

                    Duetodate:
                        formatApiDate(
                            data.Duetodate
                        ),

                    course_start_date:
                        formatApiDate(
                            data.course_start_date
                        ),

                    course_end_date:
                        formatApiDate(
                            data.course_end_date
                        ),

                    exam_start_date:
                        formatApiDate(
                            data.exam_start_date
                        ),

                    exam_end_date:
                        formatApiDate(
                            data.exam_end_date
                        ),
                };

                console.log(
                    "Formatted Edit Data:",
                    formatted
                );

                setInitialData(
                    formatted
                );

                reset(formatted);
            } catch (error: any) {
                console.error(
                    "Failed to load program batch semester:",
                    error
                );

                showAlert(
                    error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    "Failed to load program batch semester",
                    "error"
                );
            }
        };

        fetchData();
    }, [
        id,
        reset,
    ]);

    /* ------------------------------------------------------------------------ */
    /*                              BACK                                        */
    /* ------------------------------------------------------------------------ */

    const handleBack = () => {
        if (isDirty) {
            showConfirm(
                "You have unsaved changes. Your changes will be lost.",
                () => {
                    navigate(-1);
                },
                () => { }
            );

            return;
        }

        navigate(-1);
    };

    /* ------------------------------------------------------------------------ */
    /*                              RESET                                       */
    /* ------------------------------------------------------------------------ */

    const handleReset = () => {
        if (
            id &&
            initialData
        ) {
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

    /* ------------------------------------------------------------------------ */
    /*                              SUBMIT                                      */
    /* ------------------------------------------------------------------------ */

    const onSubmit = async (
        data: FormValues
    ) => {
        try {
            const payload = {
                program_id: Number(
                    data.program_id
                ),

                batch: data.batch.trim(),

                semester: data.semester.trim(),

                Duefrmdate: data.Duefrmdate
                    ? dayjs(
                        data.Duefrmdate
                    ).format("YYYY-MM-DD")
                    : null,

                Duetodate: data.Duetodate
                    ? dayjs(
                        data.Duetodate
                    ).format("YYYY-MM-DD")
                    : null,

                course_start_date:
                    data.course_start_date
                        ? dayjs(
                            data.course_start_date
                        ).format("YYYY-MM-DD")
                        : null,

                course_end_date:
                    data.course_end_date
                        ? dayjs(
                            data.course_end_date
                        ).format("YYYY-MM-DD")
                        : null,

                exam_start_date:
                    data.exam_start_date
                        ? dayjs(
                            data.exam_start_date
                        ).format("YYYY-MM-DD")
                        : null,

                exam_end_date:
                    data.exam_end_date
                        ? dayjs(
                            data.exam_end_date
                        ).format("YYYY-MM-DD")
                        : null,
            };

            console.log(
                "Program Batch Semester Payload:",
                payload
            );

            if (id) {
                await apiRequest({
                    url: `${ApiRoutes.PROGRAMBATCHSEMESTERUPDATE}/${Number(
                        id
                    )}`,
                    method: "put",
                    data: payload,
                });

                showAlert(
                    "Program batch semester updated successfully",
                    "success"
                );
            } else {
                await apiRequest({
                    url:
                        ApiRoutes.PROGRAMBATCHSEMESTERCREATE,
                    method: "post",
                    data: payload,
                });

                showAlert(
                    "Program batch semester created successfully",
                    "success"
                );
            }

            navigate(
                "/program-batch-semester/list"
            );
        } catch (error: any) {
            console.error(
                "Save error:",
                error
            );

            showAlert(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to save program batch semester",
                "error"
            );
        }
    };
    /* ------------------------------------------------------------------------ */
    /*                                UI                                        */
    /* ------------------------------------------------------------------------ */

    return (
        <Box
            sx={{
                p: {
                    xs: 2,
                    md: 4,
                },
            }}
        >
            <form
                onSubmit={handleSubmit(
                    onSubmit
                )}
            >
                <CardComponent
                    sx={{
                        p: 4,
                    }}
                >
                    <Grid
                        container
                        spacing={3}
                    >
                        {/* ============================================================ */}
                        {/* PROGRAM                                                        */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="program_id"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomSelect
                                        label="Program"
                                        field={field}
                                        options={
                                            programs
                                        }
                                        helperText={
                                            errors
                                                .program_id
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* BATCH                                                         */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="batch"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomSelect
                                        label="Batch"
                                        field={field}
                                        options={
                                            batchOptions
                                        }
                                        helperText={
                                            errors
                                                .batch
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* SEMESTER                                                      */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="semester"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomSelect
                                        label="Semester"
                                        field={field}
                                        options={
                                            semesterOptions
                                        }
                                        helperText={
                                            errors
                                                .semester
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* DUE FROM DATE                                                 */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="Duefrmdate"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Due From Date"
                                        field={field}
                                        error={
                                            !!errors.Duefrmdate
                                        }
                                        helperText={
                                            errors
                                                .Duefrmdate
                                                ?.message
                                        }
                                        disabled
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* DUE TO DATE                                                   */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="Duetodate"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Due To Date"
                                        field={field}
                                        error={
                                            !!errors.Duetodate
                                        }
                                        helperText={
                                            errors
                                                .Duetodate
                                                ?.message
                                        }
                                        disabled
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* COURSE START DATE                                             */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="course_start_date"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Course Start Date"
                                        field={field}
                                        error={
                                            !!errors.course_start_date
                                        }
                                        helperText={
                                            errors
                                                .course_start_date
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* COURSE END DATE                                               */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="course_end_date"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Course End Date"
                                        field={field}
                                        error={
                                            !!errors.course_end_date
                                        }
                                        helperText={
                                            errors
                                                .course_end_date
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* EXAM START DATE                                               */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="exam_start_date"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Exam Start Date"
                                        field={field}
                                        error={
                                            !!errors.exam_start_date
                                        }
                                        helperText={
                                            errors
                                                .exam_start_date
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        {/* ============================================================ */}
                        {/* EXAM END DATE                                                 */}
                        {/* ============================================================ */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Controller
                                name="exam_end_date"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <CustomDateInput
                                        label="Exam End Date"
                                        field={field}
                                        error={
                                            !!errors.exam_end_date
                                        }
                                        helperText={
                                            errors
                                                .exam_end_date
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    {/* ================================================================ */}
                    {/* BUTTONS                                                          */}
                    {/* ================================================================ */}

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            mt: 4,
                            justifyContent:
                                "flex-end",
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={
                                handleBack
                            }
                        >
                            Back
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={
                                handleReset
                            }
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
                                <CircularProgress
                                    size={20}
                                />
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