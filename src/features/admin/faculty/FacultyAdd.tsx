// --- IMPORTS
import { useEffect, useState } from "react";
import { Box, Grid, Button, FormControl, CircularProgress } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAlert } from "../../../context/AlertContext";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes } from "../../../constants/ApiConstants";
import dayjs from "dayjs";
import Customtext from "../../../components/inputs/customtext/Customtext";
import CustomInputText from "../../../components/inputs/customtext/CustomInputText";
import CustomSelect from "../../../components/inputs/customtext/CustomSelect";
import CustomRadioInput from "../../../components/inputs/customtext/CustomRadioInput";
import CustomDateInput from "../../../components/inputs/customtext/CustomDateInput";
import CardComponent from "../../../components/card/Card";
import { useLoader } from "../../../context/LoaderContext";
import { useGlobalError } from "../../../context/ErrorContext";
import FacultyFormSkeleton from "../../../components/card/skeletonloader/FacultyFormSkeleton";

import { Dayjs } from "dayjs";
import CustomNumberInput from "../../../components/inputs/customtext/CustomNumberInput";

export interface FacultyFormValues {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: number;

  faculty: string | null;
  department_id: number;
  designation: string | null;
  qualification: string | null;
  specialization: string | null;

  joining_date: Dayjs | null;
  experience_years: number;
  employment_type: string | null;

  gender: string | null;
  dob: Dayjs | null;
}



// ==================================
// CONSTANTS
// ==================================
const employmentOptions = [
  { name: "Internal", id: "Internal" },
  { name: "External", id: "External" }
];

const genderOptions = [
  "Male",
  "Female",
  "Other"
];


// ==================================
// DEFAULT VALUES
// ==================================
const defaultValues: FacultyFormValues = {
  id: 0,
  employee_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: 0,

  faculty: "CDOE",
  department_id: 0,
  designation: null,
  qualification: null,
  specialization: null,

  joining_date: null,
  experience_years: 0,
  employment_type: "Internal",
  gender: "Male",
  dob: null,
};



// ==================================
// VALIDATION SCHEMA
// ==================================

export const schema: Yup.ObjectSchema<FacultyFormValues> = Yup.object({
  id: Yup.number().defined(),

  employee_id: Yup.string().required("Employee ID is required"),

  first_name: Yup.string().required("First name required"),

  last_name: Yup.string().required("Last name required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email required"),

  // ✅ 10 digit phone validation
  phone: Yup.string()
    .required("Phone required")
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  role: Yup.number()
    .min(0, "Role cannot be negative")
    .defined(),

  department_id: Yup.number()
    .min(0, "Department ID cannot be negative")
    .defined(),
  faculty: Yup.string().nullable().defined(),
  designation: Yup.string().nullable().defined(),
  qualification: Yup.string().nullable().defined(),
  specialization: Yup.string().nullable().defined(),

  // ✅ Prevent future joining date (NO PLUGIN REQUIRED)
  joining_date: Yup.mixed<Dayjs>()
    .nullable()
    .test(
      "not-in-future",
      "Joining date cannot be in the future",
      (value) => {
        if (!value) return true;
        return !dayjs(value).isAfter(dayjs(), "day");
      }
    )
    .defined(),

  experience_years: Yup.number()
    .min(0, "Experience cannot be negative")
    .defined(),

  employment_type: Yup.string().nullable().defined(),

  gender: Yup.string().nullable().defined(),

  // ✅ Prevent future DOB (NO PLUGIN REQUIRED)
  dob: Yup.mixed<Dayjs>()
    .nullable()
    .test(
      "not-in-future",
      "Date of birth cannot be in the future",
      (value) => {
        if (!value) return true;
        return !dayjs(value).isAfter(dayjs(), "day");
      }
    )
    .defined(),
});





// ==================================
// COMPONENT
// ==================================
export default function FacultyAdd() {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useAlert();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id"); // id will be "1"
  const { loading } = useLoader();
  const { clearError } = useGlobalError();

  const [initialData, setInitialData] = useState<any>(null);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any[]>([]);

  // ==================================
  // FETCH ROLES
  // ==================================
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest({ url: ApiRoutes.GETROLES, method: "get" });
        setRoleOptions(res.data);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest({ url: ApiRoutes.GETDEPARTMENTS, method: "get" });
        setDepartmentOptions(res.data); // res = [{id,name}, ...]
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    })();
  }, []);


  // ==================================
  // FORM HOOK
  // ==================================
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<FacultyFormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const generateExternalEmployeeId = () => {
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    return `EX${randomFourDigits}`;
  };
  const employmentType = watch("employment_type");
  useEffect(() => {
    if (employmentType === "External") {
      const generatedId = generateExternalEmployeeId();
      setValue("employee_id", generatedId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [employmentType, setValue]);


  // ==================================
  // FETCH FACULTY (EDIT MODE)
  // ==================================
  useEffect(() => {
    console.log("FacultyAdd useEffect triggered with id:", id);

    if (!id) {
      console.log("No faculty ID found in URL params");
      return;
    }

    console.log("Fetching faculty data for ID:", id);

    const fetchFaculty = async () => {
      try {
        const res = await apiRequest({ url: `${ApiRoutes.GETFACULTYBYID}/${id}`, method: "get" });
        console.log("Faculty API response:", res);

        const d = res?.data[0] || res;

        const mapped: any = {
          employee_id: d.employee_id ?? "",
          faculty: d.faculty ?? "CDOE",
          department_id: d.department_id ?? 0,
          designation: d.designation ?? "",
          qualification: d.qualification ?? "",
          specialization: d.specialization ?? "",
          joining_date: d.joining_date ? dayjs(d.joining_date) : dayjs(),
          experience_years: Number(d.experience_years ?? 0),
          employment_type: d.employment_type ?? "Internal",
          gender: d.gender ?? "Male",
          dob: d.dob ? dayjs(d.dob) : null,

          id: d.id ?? id,
          first_name: d.first_name ?? "",
          last_name: d.last_name ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",

          // ✅ FIXED
          role: d.role ?? 0,
        };

        setInitialData(mapped);
        reset(mapped);
      } catch (err) {
        console.error("Failed to fetch faculty by ID:", err);
        showAlert?.("Failed to load faculty data", "error");
      }
    };

    fetchFaculty();
  }, [id, reset]);


  // ==================================
  // HANDLERS
  // ==================================
  const handleBack = () => {
    if (isDirty) showConfirm("Unsaved changes will be lost. Continue?", () => navigate(-1));
    else navigate(-1);
  };

  const handleReset = () => {
    if (id && initialData) reset(initialData);
    else reset(defaultValues);
  };
  const onSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        joining_date: formData.joining_date
          ? dayjs(formData.joining_date).format("YYYY-MM-DD")
          : null,
        dob: formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : null,
      };

      if (id) {
        await apiRequest({ url: `${ApiRoutes.FACULTYUPDATE}/${id}`, method: "put", data: payload });
        const selectedRole = roleOptions.find(
          (option: any) => Number(option.id) === Number(formData.role)
        );

        const roleName = String(selectedRole?.name ?? "Faculty");

        showAlert(`${roleName} updated successfully`, "success");
      
      } else {
        await apiRequest({
          url: ApiRoutes.FACULTYADD,
          method: "post",
          data: payload,
        });

        const selectedRole = roleOptions.find(
          (option: any) =>
            Number(option.id) === Number(formData.role)
        );

        const roleName = String(
          selectedRole?.name ?? "Faculty"
        );

        showAlert(`${roleName} created successfully.`, "success");
      }
      clearError();
      // Navigate to faculty list page after success
      navigate("/faculty"); // <-- replace with your actual faculty page route 
    
    } catch (err: any) {
      const responseData = err?.response?.data;
      const detail =
        responseData?.detail ??
        err?.detail ??
        err?.message?.detail ??
        err?.message;

      const duplicateFields = detail?.fields;

      if (
        duplicateFields &&
        typeof duplicateFields === "object"
      ) {
        (["employee_id", "email", "phone"] as const).forEach(
          (field) => {
            if (duplicateFields[field]) {
              setError(field, {
                type: "server",
                message: String(duplicateFields[field]),
              });
            } else {
              clearErrors(field);
            }
          }
        );
        return;
      }

      const message =
        typeof detail === "string"
          ? detail
          : detail?.message ?? "Save failed";

      const field = detail?.field as
        | "employee_id"
        | "email"
        | "phone"
        | undefined;

      if (field && detail?.message) {
        setError(field, {
          type: "server",
          message: String(detail.message),
        });
        return;
      }

      showAlert(String(message), "error");
    }

  };


  // ==================================
  // UI RETURN
  // ==================================
  return (
    <>
      {(
        loading ? (
          <FacultyFormSkeleton />
        ) : (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardComponent sx={{ p: 3 }}>
                  <Customtext fieldName="Profile & Account" sx={{ mb: 2 }} />

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="employment_type"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            label="Employment Type"
                            field={field}
                            options={employmentOptions}
                            // error={errors.employment_type}
                            helperText={errors.employment_type?.message}
                          />
                        )}
                      />
                    </Grid>
                    {/* EMPLOYEE ID */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="employee_id"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Employee ID"
                            field={field}
                            error={!!errors.employee_id}
                            helperText={errors.employee_id?.message}
                            disabled={employmentType === "External"} // 👈 key line
                          />
                        )}
                      />

                    </Grid>

                    {/* FIRST NAME */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller name="first_name" control={control} render={({ field }) => (
                        <CustomInputText label="First Name" field={field} error={!!errors.first_name} helperText={errors.first_name?.message} />
                      )} />
                    </Grid>

                    {/* LAST NAME */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller name="last_name" control={control} render={({ field }) => (
                        <CustomInputText label="Last Name" field={field} error={!!errors.last_name} helperText={errors.last_name?.message} />
                      )} />
                    </Grid>

                    {/* EMAIL */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Email"
                            field={{
                              ...field,
                              onChange: (e: any) => {
                                clearErrors("email");
                                field.onChange(e);
                              },
                            }}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                          />
                        )}
                      />
                    </Grid>

                    {/* PHONE */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <CustomNumberInput
                            label="Phone"
                            value={field.value}
                            maxLength={10}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            onChange={(val) => field.onChange(val)}
                          />

                        )}
                      />
                    </Grid>


                    {/* ROLE - NEW DROPDOWN */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            label="Role"
                            field={field}
                            options={roleOptions}
                            error={!!errors.role}
                            helperText={errors.role?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="faculty"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Faculty"
                            field={field}
                            error={!!errors.faculty}
                            helperText={errors.faculty?.message}
                            disabled
                          // ensure the field shows the value from the controller
                          // value={field.value ?? "CDOE"}
                          // onChange={field.onChange}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="department_id"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            label="Department"
                            field={field}
                            options={departmentOptions}
                            error={!!errors.department_id}
                            helperText={errors.department_id?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="designation"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Designation"
                            field={field}
                            error={!!errors.designation}
                            helperText={errors.designation?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="qualification"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Qualification"
                            field={field}
                            error={!!errors.qualification}
                            helperText={errors.qualification?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="specialization"
                        control={control}
                        render={({ field }) => (
                          <CustomInputText
                            label="Specialization"
                            field={field}
                            error={!!errors.specialization}
                            helperText={errors.specialization?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="joining_date"
                        control={control}
                        render={({ field }) => (
                          <CustomDateInput
                            label="Joining Date"
                            field={field}
                            disableFuture   // ✅ prevents future selection
                            error={!!errors.joining_date}
                            helperText={errors.joining_date?.message}
                          />
                        )}
                      />
                    </Grid>


                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="experience_years"
                        control={control}
                        render={({ field }) => (
                          <CustomNumberInput
                            label="Experience"
                            value={field.value}
                            min={0}
                            error={!!errors.experience_years}
                            helperText={errors.experience_years?.message}
                            onChange={(val) => field.onChange(val)}
                          />

                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} display={"flex"} alignItems="center">
                      <FormControl component="fieldset">
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <CustomRadioInput
                              label="Gender  :"
                              field={field}
                              options={genderOptions}
                              error={!!errors.gender}
                              helperText={errors.gender?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => (
                          <CustomDateInput
                            label="Date of Birth"
                            field={field}
                            disableFuture   // ✅ prevents future selection
                            error={!!errors.dob}
                            helperText={errors.dob?.message}
                          />
                        )}
                      />
                    </Grid>

                  </Grid>

                  {/* Buttons */}
                  <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
                    <Button variant="contained" onClick={handleBack}>
                      Back
                    </Button>

                    <Button variant="outlined" color="error" onClick={handleReset}>
                      Reset
                    </Button>

                    <Button type="submit" variant="contained" color="secondary" disabled={loading}>
                      {loading ? <CircularProgress size={20} /> : id ? "Update" : "Submit"}
                    </Button>
                  </Box>
                </CardComponent>
              </form>
            </Box>
          </LocalizationProvider>
        ))}
    </>
  );
}
