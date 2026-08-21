import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  useTheme,
  Link
} from "@mui/material";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAlert } from "../../../../context/AlertContext";
import { jwtDecode } from "jwt-decode";
import { setValue } from "../../../../utils/localStorageUtil";
import bgimage from "/assets/images/bgimage.png";
import { encryptPassword } from "../../../../utils/encryption";
import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import logo2 from "/assets/logo2.png";
import Customtext from "../../../../components/inputs/customtext/Customtext";
import { useNavigate } from "react-router-dom";

interface FormValues {
  username: string;
  password: string;
}

interface JwtPayload {
  username: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

function LoginPage() {
  const { showAlert } = useAlert();
  const theme = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePassword = () =>
    setShowPassword(!showPassword);

  const schema = Yup.object().shape({
    username: Yup.string()
      .required("Username is required")
      .matches(
        /^[a-zA-Z0-9._-]{3,}$/,
        "Enter a valid username"
      ),
    password: Yup.string().required(
      "Password is required"
    ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleData = async (
    data: FormValues
  ) => {
    try {
      setLoading(true);

      const encryptedPassword =
        encryptPassword(data.password);

      const result = await apiRequest({
        url: ApiRoutes.LOGIN,
        method: "post",
        data: {
          username: data.username,
          password: encryptedPassword,
          is_encrypted: true,
        },
      });

      setValue(
        "ACCESS_TOKEN_KEY",
        result.access_token
      );

      const user = jwtDecode<JwtPayload>(
        result.access_token
      );
      console.log(user);
      

      setValue("username", user.username);
      setValue("email", user.email);
      setValue("rollid", user.group_id);
      setValue("student_id", user.student_id);
      setValue("gender", user?.gender);
      setValue(
        "token_time",
        JSON.stringify(user?.exp)
      );
      setValue('faculty_id',user?.faculty_id)
      setValue('user_id',user?.id)

      showAlert(
        "Login successful",
        "success"
      );

      /* Role-based navigation */
      const groupId = user.group_id;
      if (groupId === 6 || groupId === 7) {
        // HOD or Director — go straight to Marks page
        navigate("/marks/add");
      } else if (groupId === 1) {
        // Admin
        navigate("/dashboard");
      } else if (groupId === 5) {
        // Faculty
        navigate("/marks/add");
      } else {
        // Student or anything else
        navigate("/dashboard/student");
      }

      /* Role-based navigation */
      // if (user.group_id === 1) {
      //   navigate("/dashboard");
      // } else {
      //   navigate("/dashboard/student");
      // }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      showAlert(
        "Invalid username or password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-end bg-gray-100 relative px-4 sm:px-6 lg:px-12">

      {/* Logo */}
      <img
        src={logo2}
        alt="Logo"
        className="absolute top-6 left-6 w-60 md:w-80"
      />

      {/* Background */}
      <Box className="hidden xl:block absolute inset-0">
        <img
          src={bgimage}
          alt="auth-login-cover"
          className="
            absolute
            top-1/6
            md:w-[600px] md:h-[600px] md:left-[10%]
            sm:w-[300px] sm:h-[300px] sm:left-[5%]
          "
        />

        <img
          src="https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/illustrations/bg-shape-image-light.png"
          alt="platform-bg"
          className="absolute bottom-0 left-0 w-full h-80"
        />
      </Box>

      {/* Form */}
      <Box className="w-full max-w-md md:mr-4">
        <Paper
          elevation={6}
          className="p-8"
          component="form"
          onSubmit={handleSubmit(handleData)}
        >
          <Typography
            variant="h5"
            fontWeight="500"
            gutterBottom
          >
            Welcome to SIS! 👋
          </Typography>

          <Customtext
            variantName="body1"
            fieldName="Please sign-in to your account"
            sx={{
              color:
                theme.palette.custom.accent,
            }}
          />

          {/* Username */}
          <Box className="relative mb-4 mt-7">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              {...register("username")}
              error={!!errors.username}
              helperText={
                errors.username?.message
              }
            />

            <Mail className="absolute right-3 top-3 w-5 h-5 pointer-events-none" />
          </Box>

          {/* Password */}
          <Box className="relative mb-2">
            <TextField
              fullWidth
              label="Password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              variant="outlined"
              {...register("password")}
              error={!!errors.password}
              helperText={
                errors.password?.message
              }
            />

            {showPassword ? (
              <FiEye
                className="absolute right-3 top-3 w-5 h-5 cursor-pointer"
                onClick={
                  togglePassword
                }
              />
            ) : (
              <FiEyeOff
                className="absolute right-3 top-3 w-5 h-5 cursor-pointer"
                onClick={
                  togglePassword
                }
              />
            )}
          </Box>

          {/* Forgot Password */}
          <Box className="flex justify-end mb-4">
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
              sx={{
                color:
                  theme.palette.primary.main,
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor:
                theme.palette
                  .secondary.main,
              textTransform: "none",
              py: 1.5,
              fontWeight: 600,
              mt: 1,
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;