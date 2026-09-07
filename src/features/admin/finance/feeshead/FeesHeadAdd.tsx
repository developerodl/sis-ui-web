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

import apiClient from "../../../../services/ApiClient";
import CustomInputText from "../../../../components/inputs/customtext/CustomInputText";


/* -------------------------------- types -------------------------------- */

interface FormValues {
    account_head: string;
    gl_code: string;
}


/* ---------------------------- default values ---------------------------- */

const defaultValues: FormValues = {
    account_head: "",
    gl_code: "",
};


/* ----------------------------- validation ------------------------------ */

const schema = Yup.object().shape({
    account_head: Yup.string()
        .trim()
        .required("Account Head is required"),

    gl_code: Yup.string()
        .trim()
        .required("GL Code is required"),
});


/* ----------------------------- component -------------------------------- */

export default function FeeHeadAdd() {

    const navigate = useNavigate();

    const { id } = useParams();

    const { showAlert, showConfirm } =
        useAlert();

    const { loading } =
        useLoader();

    const { clearError } =
        useGlobalError();


    const [initialData, setInitialData] =
        useState<FormValues | null>(null);


    const {
        control,
        handleSubmit,
        reset,
        formState: {
            errors,
            isDirty,
        },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues,
    });


    /* --------------------------- clear error --------------------------- */

    useEffect(() => {
        clearError();
    }, []);


    /* --------------------------- edit mode --------------------------- */

    useEffect(() => {

        if (!id) {
            return;
        }


        const fetchFeeHead = async () => {

            try {

                const res = await apiClient.get(
                    `${ApiRoutes.FEEHEADGETBYID}/${Number(id)}`
                );


                const data = res.data;


                const formatted: FormValues = {
                    account_head:
                        data?.account_head || "",

                    gl_code:
                        data?.gl_code || "",
                };


                setInitialData(formatted);

                reset(formatted);

            } catch (error: any) {

                showAlert(
                    error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    "Failed to load fee head",
                    "error"
                );

            }

        };


        fetchFeeHead();

    }, [id, reset, showAlert]);


    /* ----------------------------- handlers ----------------------------- */

    const handleBack = () => {

        if (isDirty) {

            showConfirm(
                "You have unsaved changes. Your changes will be lost.",

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
                account_head:
                    data.account_head.trim(),

                gl_code:
                    data.gl_code.trim(),
            };


            /* ------------------------- UPDATE ------------------------- */

            if (id) {

                await apiRequest({
                    url:
                        `${ApiRoutes.FEEHEADUPDATE}/${Number(id)}`,

                    method: "put",

                    data: payload,
                });


                showAlert(
                    "Fee head updated successfully",
                    "success"
                );


            }

            /* -------------------------- CREATE -------------------------- */

            else {

                await apiRequest({
                    url:
                        ApiRoutes.FEEHEADCREATE,

                    method: "post",

                    data: payload,
                });


                showAlert(
                    "Fee head created successfully",
                    "success"
                );

            }


            navigate("/fee-head/list");

        } catch (error: any) {

            showAlert(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to save fee head",
                "error"
            );

        }

    };


    /* -------------------------------- UI -------------------------------- */

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
                onSubmit={handleSubmit(onSubmit)}
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

                        {/* ---------------- ACCOUNT HEAD ---------------- */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >

                            <Controller
                                name="account_head"
                                control={control}

                                render={({ field }) => (

                                    <CustomInputText
                                        label="Account Head"
                                        field={field}
                                        error={!!errors.account_head}
                                        helperText={errors.account_head?.message}
                                    />

                                )}

                            />

                        </Grid>


                        {/* ---------------- GL CODE ---------------- */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >

                            <Controller
                                name="gl_code"
                                control={control}

                                render={({ field }) => (

                                    <CustomInputText
                                        label="GL Code"
                                        field={field}
                                        error={!!errors.gl_code}
                                        helperText={errors.gl_code?.message}
                                    />

                                )}

                            />

                        </Grid>

                    </Grid>


                    {/* ---------------- BUTTONS ---------------- */}

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            mt: 4,
                            justifyContent: "flex-end",
                        }}
                    >

                        {/* Back */}

                        <Button
                            variant="contained"
                            onClick={handleBack}
                        >
                            Back
                        </Button>


                        {/* Reset */}

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>


                        {/* Submit / Update */}

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