import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Grid,
    Switch,
} from "@mui/material";
import {
    Controller,
    useForm,
    useFieldArray,
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
import CustomInputText from "../../../../components/inputs/customtext/CustomInputText";

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
    admission_year: string;
    semester: string;
    pending_payment_workflow_enabled: boolean;

    course_start_date: Date | null;
    course_end_date: Date | null;

    exam_start_date: Date | null;
    exam_end_date: Date | null;
    fees_start_date: Date | null;
    fees_end_date: Date | null;
    fee_details: { fee_head_id: string; amount: string }[];
}

type FeeDetailsForm = FormValues["fee_details"];
interface FeeHead { id: number; account_head: string; gl_code: string }

/* -------------------------------------------------------------------------- */
/*                              DEFAULT VALUES                                */
/* -------------------------------------------------------------------------- */

const defaultValues: FormValues = {
    program_id: "",
    batch: "",
    admission_year: "",
    semester: "",
    pending_payment_workflow_enabled: false,

    course_start_date: null,
    course_end_date: null,

    exam_start_date: null,
    exam_end_date: null,
    fees_start_date: null,
    fees_end_date: null,
    fee_details: [],
};

/* -------------------------------------------------------------------------- */
/*                            SEMESTER OPTIONS                                */
/* -------------------------------------------------------------------------- */

const semesterOptions = [
    {
        label: "Semester 1",
        value: "1",
    },
    {
        label: "Semester 2",
        value: "2",
    },
    {
        label: "Semester 3",
        value: "3",
    },
    {
        label: "Semester 4",
        value: "4",
    },
    {
        label: "Semester 5",
        value: "5",
    },
    {
        label: "Semester 6",
        value: "6",
    },
    {
        label: "Semester 7",
        value: "7",
    },
    {
        label: "Semester 8",
        value: "8",
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

        admission_year: Yup.string()
            .trim()
            .required("Admission year is required"),

        semester: Yup.string()
            .trim()
            .required("Semester is required"),

        pending_payment_workflow_enabled: Yup.boolean()
            .defined(),

        course_start_date: Yup.date()
            .nullable()
            .defined(),

        course_end_date: Yup.date()
            .nullable()
            .defined()
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
            .defined(),

        exam_end_date: Yup.date()
            .nullable()
            .defined()
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
        fees_start_date: Yup.date().nullable().defined(),
        fees_end_date: Yup.date()
            .nullable()
            .defined()
            .test("fees-end-after-start", "Fees End Date must be on or after Fees Start Date", function (value) {
                const { fees_start_date } = this.parent as FormValues;
                return !value || !fees_start_date || new Date(value) >= new Date(fees_start_date);
            }),
        fee_details: Yup.array().of(Yup.object({
            fee_head_id: Yup.string().required("Select a fee head"),
            amount: Yup.string().required("Enter an amount").test("valid-amount", "Enter a valid non-negative amount", (value) => value === undefined || (value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0)),
        }).required()).required(),
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

const normalizeSemester = (semester: unknown): string => {
    const value = String(semester ?? "").trim();
    const match = value.match(/(?:semester\s*)?(\d+)/i);
    return match?.[1] ?? value;
};

const formatDateForApi = (date: unknown): string | null => {
    if (!date) return null;

    const parsed = dayjs(date as dayjs.ConfigType);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};

const feeDetailsToForm = (details: any): FeeDetailsForm => {
    if (Array.isArray(details)) {
        return details.map((fee: any) => ({
            fee_head_id: String(fee.fee_head_id ?? fee.id ?? ""),
            amount: String(fee.amount ?? ""),
        }));
    }
    const legacyKeys = ["application_fee", "admission_fee", "tuition_fee", "lms_fee", "exam_fee", "lab_fee"];
    return legacyKeys.flatMap((key, index) => details?.[key] == null || details[key] === "" ? [] : [{ fee_head_id: String(index + 1), amount: String(details[key]) }]);
};

const feeDetailsToPayload = (details: FeeDetailsForm) =>
    details.filter((fee) => fee.fee_head_id && fee.amount.trim() !== "").map((fee) => ({
        fee_head_id: Number(fee.fee_head_id),
        amount: Number(fee.amount),
    }));

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
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);

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
        formState: {
            errors,
            isDirty,
        },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues,
    });
    const { fields: feeDetailFields, append: appendFeeDetail, remove: removeFeeDetail } = useFieldArray({ control, name: "fee_details" });
    /* ------------------------------------------------------------------------ */
    /*                              WATCH                                       */
    /* ------------------------------------------------------------------------ */

    // const courseStartDate = watch(
    //     "course_start_date"
    // );
    const feeDetails = watch("fee_details");
    const totalFee = (feeDetails ?? []).reduce(
        (total, fee) => total + (Number(fee.amount) || 0),
        0
    );

    useEffect(() => {
        const fetchFeeHeads = async () => {
            try {
                const response = await apiClient.get(ApiRoutes.FEEHEADGETALL);
                const result = Array.isArray(response.data) ? response.data : response.data?.data || [];
                setFeeHeads(result);
            } catch (error) {
                console.error("Failed to load fee heads:", error);
                showAlert("Failed to load fee heads", "error");
            }
        };
        fetchFeeHeads();
    }, []);

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
                        ApiRoutes.PROGRAMBATCHSEMESTERGETBYID(Number(id))
                    );

                console.log(
                    "Program Batch Semester Response:",
                    response.data
                );

                const responseData =
                    response?.data?.data ?? response?.data;
                const unwrappedResponse = Array.isArray(responseData)
                    ? responseData[0]
                    : responseData;
                const data =
                    unwrappedResponse?.program_batch_semester ??
                    (typeof unwrappedResponse?.batch === "object"
                        ? unwrappedResponse.batch
                        : unwrappedResponse);

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

                    admission_year:
                        data.admission_year ?? "",

                    semester: normalizeSemester(data.semester),

                    pending_payment_workflow_enabled:
                        Boolean(data.pending_payment_workflow_enabled),

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
                    fees_start_date: formatApiDate(data.fees_start_date),
                    fees_end_date: formatApiDate(data.fees_end_date),
                    fee_details: feeDetailsToForm(data.fee_details),
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

                admission_year: data.admission_year.trim(),

                semester: `Semester ${normalizeSemester(data.semester)}`,

                course_start_date: formatDateForApi(data.course_start_date),

                course_end_date: formatDateForApi(data.course_end_date),

                exam_start_date: formatDateForApi(data.exam_start_date),

                exam_end_date: formatDateForApi(data.exam_end_date),
                fees_start_date: formatDateForApi(data.fees_start_date),
                fees_end_date: formatDateForApi(data.fees_end_date),
                pending_payment_workflow_enabled: data.pending_payment_workflow_enabled,
                fee_details: feeDetailsToPayload(data.fee_details),
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
            console.error("Save error:", error);
            console.error("Save error response:", error?.response?.data);

            showAlert(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to save program batch semester",
                "error"
            );
        }
    };

    const onInvalidSubmit = (validationErrors: typeof errors) => {
        console.error("Program batch semester validation failed:", validationErrors);
        console.table(
            Object.entries(validationErrors).map(([field, error]) => ({
                field,
                message: error?.message,
            }))
        );
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
                onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
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
                                        error={!!errors.program_id}
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
                                    <CustomInputText
                                        label="Batch"
                                        field={field}
                                        error={!!errors.batch}
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
                                        error={!!errors.semester}
                                        helperText={
                                            errors
                                                .semester
                                                ?.message
                                        }
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="admission_year"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputText
                                        label="Admission Year"
                                        field={field}
                                        error={!!errors.admission_year}
                                        helperText={errors.admission_year?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="fees_start_date"
                                control={control}
                                render={({ field }) => (
                                    <CustomDateInput
                                        label="Fees Start Date"
                                        field={field}
                                        error={!!errors.fees_start_date}
                                        helperText={errors.fees_start_date?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="fees_end_date"
                                control={control}
                                render={({ field }) => (
                                    <CustomDateInput
                                        label="Fees End Date"
                                        field={field}
                                        error={!!errors.fees_end_date}
                                        helperText={errors.fees_end_date?.message}
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

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                <Box sx={{ fontWeight: 600 }}>Fee Details</Box>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => appendFeeDetail({ fee_head_id: "", amount: "" })}
                                    disabled={feeHeads.length === 0 || feeDetailFields.length >= feeHeads.length}
                                >
                                    + Add Fee
                                </Button>
                            </Box>
                        </Grid>
                        {feeDetailFields.map((row, index) => {
                            const selectedIds = (feeDetails ?? []).map((fee) => fee.fee_head_id).filter(Boolean);
                            const selectedId = feeDetails?.[index]?.fee_head_id;
                            const availableHeads = feeHeads
                                .filter((head) => !selectedIds.includes(String(head.id)) || String(head.id) === selectedId)
                                .map((head) => ({ value: String(head.id), label: `${head.account_head} (${head.gl_code})` }));
                            return (
                            <Grid key={row.id} container size={{ xs: 12 }} spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                <Controller
                                    name={`fee_details.${index}.fee_head_id`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <CustomSelect
                                            label="Fee Head"
                                            field={field}
                                            options={availableHeads}
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Controller
                                        name={`fee_details.${index}.amount`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <CustomInputText
                                                label="Amount"
                                                field={field}
                                                type="number"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <Button type="button" color="error" onClick={() => removeFeeDetail(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                            );
                        })}

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ fontWeight: 600 }}>
                                Total Fee: {totalFee}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="pending_payment_workflow_enabled"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(_, checked) => field.onChange(checked)}
                                                onBlur={field.onBlur}
                                                inputRef={field.ref}
                                            />
                                        }
                                        label="Enable Pending Payment Workflow"
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
