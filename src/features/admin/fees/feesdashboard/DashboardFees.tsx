// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   Divider,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   ListItemText,
//   MenuItem,
//   Select,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TablePagination,
//   TableRow,
//   TextField,
//   Tooltip,
//   Typography,
// } from "@mui/material";

// import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
// import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
// // import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
// import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
// // import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
// import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
// import MoneyOffCsredOutlinedIcon from "@mui/icons-material/MoneyOffCsredOutlined";
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
// import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

// import apiClient from "../../../../services/ApiClient";
// import { ApiRoutes } from "../../../../constants/ApiConstants";

// /* -------------------------------------------------------------------------- */
// /*                                  TYPES                                     */
// /* -------------------------------------------------------------------------- */

// interface Summary {
//   total_enrolled_students: number;
//   total_unenrolled_students: number;
//   total_students: number;
//   semester_fee_paid_amount: number;
//   application_fee_amount: number;
//   total_paid_amount: number;
// }

// interface FilteredSummary {
//   total_enrolled_students: number;
//   total_unenrolled_students: number;
//   total_students: number;
// }

// interface FeeSummary {
//   total_demand_amount: number;
//   semester_fee_paid_amount: number;
//   application_fee_paid_amount: number;
//   total_paid_amount: number;
//   outstanding_amount: number;
// }

// interface StudentFee {
//   student_id: number;
//   application_no: string;
//   registration_no: string;
//   student_name: string;
//   program_name: string;
//   batch: string;
//   semester: string;
//   admission_year: string;

//   total_demand_amount: number;
//   semester_fee_paid_amount: number;
//   application_fee_amount: number;
//   total_paid_amount: number;
//   not_paid_amount: number;

//   paid_semesters?: {
//     semester: string;
//     paid_amount: number;
//   }[];
// }

// interface FeesDashboardResponse {
//   summary: Summary;
//   filtered_summary?: FilteredSummary | null;
//   fee_summary: FeeSummary;
//   total_students: number;
//   students: StudentFee[];
// }

// interface ProgramSemester {
//   program_id: number;
//   program_code: string;
//   semester_no: number;
//   semester_name: string;
//   id: number;
// }

// interface ProgramOption {
//   value: number;
//   label: string;
//   semesters: ProgramSemester[];
// }

// interface Filters {
//   program_id: number[];
//   batch: string[];
//   semester: string[];
//   admission_year: string[];
// }

// const initialFilters: Filters = {
//   program_id: [],
//   batch: [],
//   semester: [],
//   admission_year: [],
// };

// /* -------------------------------------------------------------------------- */
// /*                              COMPONENT                                     */
// /* -------------------------------------------------------------------------- */

// const DashboardFees: React.FC = () => {
//   const [dashboardData, setDashboardData] =
//     useState<FeesDashboardResponse | null>(null);

//   const [programs, setPrograms] = useState<ProgramOption[]>([]);

//   const [filters, setFilters] =
//     useState<Filters>(initialFilters);

//   const [appliedFilters, setAppliedFilters] =
//     useState<Filters>(initialFilters);

//   const [search, setSearch] = useState("");

//   const [loading, setLoading] = useState(false);

//   const [programLoading, setProgramLoading] =
//     useState(false);

//   const [error, setError] = useState("");

//   const [page, setPage] = useState(0);

//   const [rowsPerPage, setRowsPerPage] =
//     useState(10);

//   /* ------------------------------------------------------------------------ */
//   /*                              FORMATTERS                                  */
//   /* ------------------------------------------------------------------------ */

//   const formatCurrency = (
//     value: number | undefined | null
//   ) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(value || 0);
//   };

//   const formatNumber = (
//     value: number | undefined | null
//   ) => {
//     return new Intl.NumberFormat("en-IN").format(
//       value || 0
//     );
//   };

//   /* ------------------------------------------------------------------------ */
//   /*                              FETCH PROGRAMS                               */
//   /* ------------------------------------------------------------------------ */

//   const fetchPrograms = async () => {
//     try {
//       setProgramLoading(true);

//       const response = await apiClient.get(
//         ApiRoutes.GETPROGRAMLIST
//       );

//       const mappedPrograms: ProgramOption[] =
//         (response.data || []).map(
//           (program: any) => ({
//             value: Number(program.id),

//             label: `${program.programe}${program.programe_code
//                 ? ` (${program.programe_code})`
//                 : ""
//               }`,

//             semesters: Array.isArray(
//               program.semesters
//             )
//               ? program.semesters
//                 .map((semester: any) => ({
//                   program_id:
//                     Number(
//                       semester.program_id
//                     ),

//                   program_code:
//                     semester.program_code,

//                   semester_no:
//                     Number(
//                       semester.semester_no
//                     ),

//                   semester_name:
//                     semester.semester_name,

//                   id:
//                     Number(
//                       semester.id
//                     ),
//                 }))
//                 .sort(
//                   (
//                     a: ProgramSemester,
//                     b: ProgramSemester
//                   ) =>
//                     a.semester_no -
//                     b.semester_no
//                 )
//               : [],
//           })
//         );

//       setPrograms(mappedPrograms);

//     } catch (err) {
//       console.error(
//         "Failed to fetch programs",
//         err
//       );

//     } finally {
//       setProgramLoading(false);
//     }
//   };

//   /* ------------------------------------------------------------------------ */
//   /*                           FETCH DASHBOARD                                */
//   /* ------------------------------------------------------------------------ */

//   const fetchDashboard = async (
//     selectedFilters: Filters = initialFilters
//   ) => {
//     try {
//       setLoading(true);
//       setError("");

//       const params: Record<string, any> = {};

//       if (selectedFilters.program_id.length > 0) {
//         params.program_id =
//           selectedFilters.program_id;
//       }

//       if (selectedFilters.batch.length > 0) {
//         params.batch = selectedFilters.batch;
//       }

//       if (selectedFilters.semester.length > 0) {
//         params.semester =
//           selectedFilters.semester;
//       }

//       if (
//         selectedFilters.admission_year.length > 0
//       ) {
//         params.admission_year =
//           selectedFilters.admission_year;
//       }

//       const response = await apiClient.get(
//         ApiRoutes.DASHBOARD_FEES,
//         {
//           params,
//           paramsSerializer: {
//             indexes: null,
//           },
//         }
//       );

//       setDashboardData(response.data);

//       setPage(0);
//     } catch (err: any) {
//       console.error(
//         "Failed to fetch fees dashboard",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//         "Failed to load fees dashboard data."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------------------------------------------------------ */
//   /*                                INITIAL                                   */
//   /* ------------------------------------------------------------------------ */

//   useEffect(() => {
//     fetchPrograms();
//     fetchDashboard();
//   }, []);

//   /* ------------------------------------------------------------------------ */
//   /*                            FILTER HANDLERS                               */
//   /* ------------------------------------------------------------------------ */

//   const handleFilterChange = (
//     field: keyof Filters,
//     value: string[] | number[]
//   ) => {
//     setFilters((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleApplyFilters = () => {
//     setAppliedFilters(filters);
//     fetchDashboard(filters);
//   };

//   const handleClearFilters = () => {
//     setFilters(initialFilters);
//     setAppliedFilters(initialFilters);
//     setSearch("");

//     fetchDashboard(initialFilters);
//   };

//   const handleRefresh = () => {
//     fetchDashboard(appliedFilters);
//   };

//   /* ------------------------------------------------------------------------ */
//   /*                          ACTIVE FILTERS                                  */
//   /* ------------------------------------------------------------------------ */

//   const hasActiveFilters = useMemo(() => {
//     return Object.values(appliedFilters).some(
//       (value) => value.length > 0
//     );
//   }, [appliedFilters]);

//   /* ------------------------------------------------------------------------ */
//   /*                         FILTERED STUDENTS                                */
//   /* ------------------------------------------------------------------------ */

//   const filteredStudents = useMemo(() => {
//     if (!dashboardData?.students) {
//       return [];
//     }

//     const searchValue =
//       search.trim().toLowerCase();

//     if (!searchValue) {
//       return dashboardData.students;
//     }

//     return dashboardData.students.filter(
//       (student) => {
//         return (
//           student.student_name
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.application_no
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.registration_no
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.program_name
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.batch
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.semester
//             ?.toLowerCase()
//             .includes(searchValue) ||
//           student.admission_year
//             ?.toLowerCase()
//             .includes(searchValue)
//         );
//       }
//     );
//   }, [dashboardData?.students, search]);

//   const paginatedStudents = useMemo(() => {
//     const startIndex =
//       page * rowsPerPage;

//     return filteredStudents.slice(
//       startIndex,
//       startIndex + rowsPerPage
//     );
//   }, [
//     filteredStudents,
//     page,
//     rowsPerPage,
//   ]);

//   /* ------------------------------------------------------------------------ */
//   /*                         SELECTED PROGRAMS                                */
//   /* ------------------------------------------------------------------------ */

//   const selectedPrograms = programs.filter(
//     (program) =>
//       appliedFilters.program_id.includes(
//         program.value
//       )
//   );

//   /* ------------------------------------------------------------------------ */
//   /*                              SUMMARY DATA                                */
//   /* ------------------------------------------------------------------------ */

//   const summary = dashboardData?.summary;

//   const filteredSummary =
//     dashboardData?.filtered_summary;

//   const feeSummary =
//     dashboardData?.fee_summary;

//   /* ------------------------------------------------------------------------ */
//   /*                             SUMMARY CARD                                */
//   /* ------------------------------------------------------------------------ */

//   const SummaryCard = ({
//     title,
//     value,
//     icon,
//     description,
//     iconColor = "#105c8e",
//     currency = false,
//   }: {
//     title: string;
//     value: number;
//     icon: React.ReactNode;
//     description?: string;
//     iconColor?: string;
//     currency?: boolean;
//   }) => {
//     return (
//       <Card
//         sx={{
//           height: "100%",
//           borderRadius: 3,
//           border: "1px solid #e8edf2",
//           boxShadow:
//             "0 2px 5px rgba(0,0,0,0.05)",
//           transition: "all 0.2s ease",

//           "&:hover": {
//             transform: "translateY(-2px)",
//             boxShadow:
//               "0 5px 14px rgba(0,0,0,0.08)",
//           },
//         }}
//       >
//         <Box sx={{ p: 2.25 }}>
//           <Stack
//             direction="row"
//             alignItems="flex-start"
//             justifyContent="space-between"
//             spacing={2}
//           >
//             <Box sx={{ minWidth: 0 }}>
//               <Typography
//                 sx={{
//                   fontSize: 13,
//                   fontWeight: 500,
//                   color: "#6b7280",
//                   mb: 0.8,
//                 }}
//               >
//                 {title}
//               </Typography>

//               <Typography
//                 sx={{
//                   fontSize: {
//                     xs: 22,
//                     sm: 24,
//                   },
//                   fontWeight: 700,
//                   color: "#17212b",
//                   lineHeight: 1.2,
//                 }}
//               >
//                 {currency
//                   ? formatCurrency(value)
//                   : formatNumber(value)}
//               </Typography>

//               {description && (
//                 <Typography
//                   sx={{
//                     mt: 0.8,
//                     fontSize: 11.5,
//                     color: "#8a94a6",
//                   }}
//                 >
//                   {description}
//                 </Typography>
//               )}
//             </Box>

//             <Box
//               sx={{
//                 width: 44,
//                 height: 44,
//                 minWidth: 44,
//                 borderRadius: 2.5,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: `${iconColor}12`,
//                 color: iconColor,
//               }}
//             >
//               {icon}
//             </Box>
//           </Stack>
//         </Box>
//       </Card>
//     );
//   };

//   /* ------------------------------------------------------------------------ */
//   /*                              PAGE CONTENT                                */
//   /* ------------------------------------------------------------------------ */

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         minHeight: "100%",
//         pb: 4,
//       }}
//     >
//       {/* ------------------------------------------------------------------ */}
//       {/* PAGE HEADER                                                         */}
//       {/* ------------------------------------------------------------------ */}

//       <Box
//         sx={{
//           mb: 2.5,
//           display: "flex",
//           flexDirection: {
//             xs: "column",
//             sm: "row",
//           },
//           alignItems: {
//             xs: "flex-start",
//             sm: "center",
//           },
//           justifyContent: "space-between",
//           gap: 2,
//         }}
//       >
//         <Box>
//           <Typography
//             sx={{
//               fontSize: {
//                 xs: 21,
//                 sm: 24,
//               },
//               fontWeight: 700,
//               color: "#17212b",
//             }}
//           >
//             Fee Dashboard
//           </Typography>

//           <Typography
//             sx={{
//               mt: 0.4,
//               fontSize: 13,
//               color: "#6b7280",
//             }}
//           >
//             Monitor student fee collections,
//             payments and outstanding amounts.
//           </Typography>
//         </Box>

//         <Tooltip title="Refresh dashboard">
//           <IconButton
//             onClick={handleRefresh}
//             disabled={loading}
//             sx={{
//               width: 40,
//               height: 40,
//               border: "1px solid #dce3e8",
//               borderRadius: 2,
//               color: "#105c8e",
//               backgroundColor: "#fff",

//               "&:hover": {
//                 backgroundColor: "#f4f8fb",
//               },
//             }}
//           >
//             {loading ? (
//               <CircularProgress size={19} />
//             ) : (
//               <RefreshOutlinedIcon fontSize="small" />
//             )}
//           </IconButton>
//         </Tooltip>
//       </Box>

//       {/* ------------------------------------------------------------------ */}
//       {/* OVERALL SUMMARY                                                    */}
//       {/* ------------------------------------------------------------------ */}

//       <Box sx={{ mb: 3 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 1,
//             mb: 1.5,
//           }}
//         >
//           <Box
//             sx={{
//               width: 4,
//               height: 20,
//               borderRadius: 2,
//               backgroundColor: "#105c8e",
//             }}
//           />

//           <Typography
//             sx={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: "#263238",
//             }}
//           >
//             Overall Summary
//           </Typography>

//           <Chip
//             label="All Students"
//             size="small"
//             sx={{
//               ml: 0.5,
//               height: 23,
//               fontSize: 11,
//               fontWeight: 600,
//               backgroundColor: "#eef6fb",
//               color: "#105c8e",
//             }}
//           />
//         </Box>

//         {/* Only 3 cards remain here */}
//         <Grid container spacing={2}>
//           {/* ENROLLED STUDENTS */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Enrolled Students"
//               value={
//                 summary?.total_enrolled_students ||
//                 0
//               }
//               icon={
//                 <SchoolOutlinedIcon />
//               }
//               description="Students currently enrolled"
//               iconColor="#1976d2"
//             />
//           </Grid>

//           {/* UNENROLLED STUDENTS */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Unenrolled Students"
//               value={
//                 summary?.total_unenrolled_students ||
//                 0
//               }
//               icon={
//                 <PersonOffOutlinedIcon />
//               }
//               description="Students not yet enrolled (only paid application fees)"
//               iconColor="#ed6c02"
//             />
//           </Grid>

//           {/* TOTAL PAID */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Total Paid"
//               value={
//                 summary?.total_paid_amount || 0
//               }
//               icon={
//                 <AccountBalanceWalletOutlinedIcon />
//               }
//               description="Total amount collected"
//               iconColor="#00897b"
//               currency
//             />
//           </Grid>
//         </Grid>
//       </Box>

//       {/* ------------------------------------------------------------------ */}
//       {/* FILTERED SUMMARY                                                   */}
//       {/* ------------------------------------------------------------------ */}

//       {hasActiveFilters &&
//         filteredSummary && (
//           <Card
//             sx={{
//               mb: 3,
//               borderRadius: 3,
//               border: "1px solid #d9e8f2",
//               background:
//                 "linear-gradient(135deg, #f7fbfe 0%, #ffffff 100%)",
//               boxShadow:
//                 "0 2px 5px rgba(0,0,0,0.04)",
//             }}
//           >
//             <Box sx={{ p: 2.25 }}>
//               <Stack
//                 direction={{
//                   xs: "column",
//                   md: "row",
//                 }}
//                 justifyContent="space-between"
//                 alignItems={{
//                   xs: "flex-start",
//                   md: "center",
//                 }}
//                 spacing={2}
//               >
//                 <Box>
//                   <Stack
//                     direction="row"
//                     alignItems="center"
//                     spacing={1}
//                     sx={{ mb: 0.6 }}
//                   >
//                     <TrendingUpOutlinedIcon
//                       sx={{
//                         fontSize: 20,
//                         color: "#105c8e",
//                       }}
//                     />

//                     <Typography
//                       sx={{
//                         fontSize: 15,
//                         fontWeight: 700,
//                         color: "#263238",
//                       }}
//                     >
//                       Filtered Results
//                     </Typography>

//                     <Chip
//                       label={`${formatNumber(
//                         filteredSummary.total_students
//                       )} Students`}
//                       size="small"
//                       sx={{
//                         height: 23,
//                         fontSize: 11,
//                         fontWeight: 700,
//                         color: "#105c8e",
//                         backgroundColor:
//                           "#e7f3fa",
//                       }}
//                     />
//                   </Stack>

//                   <Typography
//                     sx={{
//                       fontSize: 12,
//                       color: "#718096",
//                     }}
//                   >
//                     Showing student counts based on
//                     the selected filters.
//                   </Typography>
//                 </Box>

//                 <Stack
//                   direction="row"
//                   spacing={1}
//                   flexWrap="wrap"
//                   useFlexGap
//                 >
//                   {selectedPrograms.map(
//                     (program) => (
//                       <Chip
//                         key={program.value}
//                         label={`Program: ${program.label}`}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                           fontSize: 11,
//                           borderColor:
//                             "#c9dce8",
//                           color: "#105c8e",
//                         }}
//                       />
//                     )
//                   )}

//                   {appliedFilters.batch.length >
//                     0 && (
//                       <Chip
//                         label={`Batch: ${appliedFilters.batch.join(
//                           ", "
//                         )}`}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                           fontSize: 11,
//                           borderColor:
//                             "#c9dce8",
//                           color: "#105c8e",
//                         }}
//                       />
//                     )}

//                   {appliedFilters.semester.length >
//                     0 && (
//                       <Chip
//                         label={`Semester: ${appliedFilters.semester
//                           .map(
//                             (semester) =>
//                               semester.replace(
//                                 /^semester\s*/i,
//                                 "Semester "
//                               )
//                           )
//                           .join(", ")}`}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                           fontSize: 11,
//                           borderColor:
//                             "#c9dce8",
//                           color: "#105c8e",
//                         }}
//                       />
//                     )}

//                   {appliedFilters.admission_year
//                     .length > 0 && (
//                       <Chip
//                         label={`Year: ${appliedFilters.admission_year.join(
//                           ", "
//                         )}`}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                           fontSize: 11,
//                           borderColor:
//                             "#c9dce8",
//                           color: "#105c8e",
//                         }}
//                       />
//                     )}
//                 </Stack>
//               </Stack>

//               <Divider sx={{ my: 2 }} />

//               <Grid container spacing={2}>
//                 {/* FILTERED STUDENTS */}

//                 <Grid size={{ xs: 12, sm: 4 }}>
//                   <Box
//                     sx={{
//                       p: 1.5,
//                       borderRadius: 2,
//                       backgroundColor: "#fff",
//                       border:
//                         "1px solid #edf1f4",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: 11,
//                         color: "#7b8794",
//                       }}
//                     >
//                       Filtered Students
//                     </Typography>

//                     <Typography
//                       sx={{
//                         mt: 0.4,
//                         fontSize: 20,
//                         fontWeight: 700,
//                         color: "#17212b",
//                       }}
//                     >
//                       {formatNumber(
//                         filteredSummary.total_students
//                       )}
//                     </Typography>
//                   </Box>
//                 </Grid>

//                 {/* ENROLLED */}

//                 <Grid size={{ xs: 12, sm: 4 }}>
//                   <Box
//                     sx={{
//                       p: 1.5,
//                       borderRadius: 2,
//                       backgroundColor: "#fff",
//                       border:
//                         "1px solid #edf1f4",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: 11,
//                         color: "#7b8794",
//                       }}
//                     >
//                       Enrolled
//                     </Typography>

//                     <Typography
//                       sx={{
//                         mt: 0.4,
//                         fontSize: 20,
//                         fontWeight: 700,
//                         color: "#2e7d32",
//                       }}
//                     >
//                       {formatNumber(
//                         filteredSummary.total_enrolled_students
//                       )}
//                     </Typography>
//                   </Box>
//                 </Grid>

//                 {/* UNENROLLED */}

//                 <Grid size={{ xs: 12, sm: 4 }}>
//                   <Box
//                     sx={{
//                       p: 1.5,
//                       borderRadius: 2,
//                       backgroundColor: "#fff",
//                       border:
//                         "1px solid #edf1f4",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: 11,
//                         color: "#7b8794",
//                       }}
//                     >
//                       Unenrolled
//                     </Typography>

//                     <Typography
//                       sx={{
//                         mt: 0.4,
//                         fontSize: 20,
//                         fontWeight: 700,
//                         color: "#ed6c02",
//                       }}
//                     >
//                       {formatNumber(
//                         filteredSummary.total_unenrolled_students
//                       )}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Card>
//         )}

//       {/* ------------------------------------------------------------------ */}
//       {/* FILTER CARD                                                        */}
//       {/* ------------------------------------------------------------------ */}

//       <Card
//         sx={{
//           mb: 3,
//           borderRadius: 3,
//           border: "1px solid #e6ebef",
//           boxShadow:
//             "0 2px 5px rgba(0,0,0,0.05)",
//         }}
//       >
//         <Box sx={{ p: 2.25 }}>
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={1}
//             sx={{ mb: 2 }}
//           >
//             <FilterAltOutlinedIcon
//               sx={{
//                 color: "#105c8e",
//                 fontSize: 21,
//               }}
//             />

//             <Typography
//               sx={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: "#263238",
//               }}
//             >
//               Filters
//             </Typography>

//             {hasActiveFilters && (
//               <Chip
//                 label="Active"
//                 size="small"
//                 sx={{
//                   height: 22,
//                   fontSize: 10.5,
//                   fontWeight: 700,
//                   backgroundColor: "#e8f3f9",
//                   color: "#105c8e",
//                 }}
//               />
//             )}
//           </Stack>

//           <Grid container spacing={2}>
//             {/* PROGRAM */}

//             <Grid
//               size={{
//                 xs: 12,
//                 sm: 6,
//                 md: 3,
//               }}
//             >
//               <FormControl
//                 fullWidth
//                 size="small"
//               >
//                 <InputLabel>
//                   Program
//                 </InputLabel>

//                 <Select
//                   multiple
//                   value={filters.program_id}
//                   label="Program"
//                   onChange={(event) =>
//                     handleFilterChange(
//                       "program_id",
//                       (
//                         event.target.value as (
//                           | string
//                           | number
//                         )[]
//                       ).map(Number)
//                     )
//                   }
//                   renderValue={(selected) => {
//                     const selectedIds =
//                       selected as number[];

//                     if (
//                       selectedIds.length ===
//                       0
//                     ) {
//                       return "All Programs";
//                     }

//                     return programs
//                       .filter((program) =>
//                         selectedIds.includes(
//                           program.value
//                         )
//                       )
//                       .map(
//                         (program) =>
//                           program.label
//                       )
//                       .join(", ");
//                   }}
//                 >
//                   {programLoading ? (
//                     <MenuItem disabled>
//                       Loading programs...
//                     </MenuItem>
//                   ) : (
//                     programs.map((program) => (
//                       <MenuItem
//                         key={program.value}
//                         value={program.value}
//                       >
//                         <Checkbox
//                           size="small"
//                           checked={filters.program_id.includes(
//                             program.value
//                           )}
//                         />

//                         <ListItemText
//                           primary={
//                             program.label
//                           }
//                         />
//                       </MenuItem>
//                     ))
//                   )}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* BATCH */}

//             <Grid
//               size={{
//                 xs: 12,
//                 sm: 6,
//                 md: 3,
//               }}
//             >
//               <FormControl
//                 fullWidth
//                 size="small"
//               >
//                 <InputLabel>
//                   Batch
//                 </InputLabel>

//                 <Select
//                   multiple
//                   value={filters.batch}
//                   label="Batch"
//                   onChange={(event) =>
//                     handleFilterChange(
//                       "batch",
//                       event.target.value as string[]
//                     )
//                   }
//                   renderValue={(selected) => {
//                     const values =
//                       selected as string[];

//                     return values.length === 0
//                       ? "All Batches"
//                       : values.join(", ");
//                   }}
//                 >
//                   {[
//                     "January",
//                     "July",
//                   ].map((batch) => (
//                     <MenuItem
//                       key={batch}
//                       value={batch}
//                     >
//                       <Checkbox
//                         size="small"
//                         checked={filters.batch.includes(
//                           batch
//                         )}
//                       />

//                       <ListItemText
//                         primary={batch}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* SEMESTER */}

//             <Grid
//               size={{
//                 xs: 12,
//                 sm: 6,
//                 md: 3,
//               }}
//             >
//               <FormControl
//                 fullWidth
//                 size="small"
//               >
//                 <InputLabel>
//                   Semester
//                 </InputLabel>

//                 <Select
//                   multiple
//                   value={filters.semester}
//                   label="Semester"
//                   onChange={(event) =>
//                     handleFilterChange(
//                       "semester",
//                       event.target.value as string[]
//                     )
//                   }
//                   renderValue={(selected) => {
//                     const values =
//                       selected as string[];

//                     return values.length === 0
//                       ? "All Semesters"
//                       : values
//                         .map(
//                           (value) =>
//                             value.replace(
//                               /^semester\s*/i,
//                               "Semester "
//                             )
//                         )
//                         .join(", ");
//                   }}
//                 >
//                   {Array.from(
//                     { length: 8 },
//                     (_, index) =>
//                       index + 1
//                   ).map((semester) => {
//                     const value = `semester ${semester}`;

//                     return (
//                       <MenuItem
//                         key={value}
//                         value={value}
//                       >
//                         <Checkbox
//                           size="small"
//                           checked={filters.semester.includes(
//                             value
//                           )}
//                         />

//                         <ListItemText
//                           primary={`Semester ${semester}`}
//                         />
//                       </MenuItem>
//                     );
//                   })}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* ADMISSION YEAR */}

//             <Grid
//               size={{
//                 xs: 12,
//                 sm: 6,
//                 md: 3,
//               }}
//             >
//               <FormControl
//                 fullWidth
//                 size="small"
//               >
//                 <InputLabel>
//                   Admission Year
//                 </InputLabel>

//                 <Select
//                   multiple
//                   value={
//                     filters.admission_year
//                   }
//                   label="Admission Year"
//                   onChange={(event) =>
//                     handleFilterChange(
//                       "admission_year",
//                       event.target.value as string[]
//                     )
//                   }
//                   renderValue={(selected) => {
//                     const values =
//                       selected as string[];

//                     return values.length === 0
//                       ? "All Admission Years"
//                       : values.join(", ");
//                   }}
//                 >
//                   {[
//                     "2025-2026",
//                     "2026-2027",
//                     "2027-2028",
//                   ].map((year) => (
//                     <MenuItem
//                       key={year}
//                       value={year}
//                     >
//                       <Checkbox
//                         size="small"
//                         checked={filters.admission_year.includes(
//                           year
//                         )}
//                       />

//                       <ListItemText
//                         primary={year}
//                       />
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>

//           {/* FILTER BUTTONS */}

//           <Stack
//             direction="row"
//             justifyContent="flex-end"
//             spacing={1.25}
//             sx={{ mt: 2 }}
//           >
//             <Button
//               variant="outlined"
//               startIcon={
//                 <ClearOutlinedIcon />
//               }
//               onClick={
//                 handleClearFilters
//               }
//               disabled={loading}
//               sx={{
//                 textTransform: "none",
//                 borderRadius: 2,
//                 borderColor: "#d2d9df",
//                 color: "#5f6b76",
//                 px: 2,

//                 "&:hover": {
//                   borderColor: "#aeb8c1",
//                   backgroundColor:
//                     "#f7f8f9",
//                 },
//               }}
//             >
//               Clear
//             </Button>

//             <Button
//               variant="contained"
//               startIcon={
//                 <FilterAltOutlinedIcon />
//               }
//               onClick={
//                 handleApplyFilters
//               }
//               disabled={loading}
//               sx={{
//                 textTransform: "none",
//                 borderRadius: 2,
//                 px: 2.5,
//                 backgroundColor:
//                   "#105c8e",
//                 boxShadow: "none",

//                 "&:hover": {
//                   backgroundColor:
//                     "#0d4d76",
//                   boxShadow: "none",
//                 },
//               }}
//             >
//               {loading ? (
//                 <CircularProgress
//                   size={18}
//                   sx={{
//                     color: "#fff",
//                   }}
//                 />
//               ) : (
//                 "Apply Filters"
//               )}
//             </Button>
//           </Stack>
//         </Box>
//       </Card>

//       {/* ------------------------------------------------------------------ */}
//       {/* FEE SUMMARY                                                        */}
//       {/* ------------------------------------------------------------------ */}

//       <Box sx={{ mb: 3 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 1,
//             mb: 1.5,
//           }}
//         >
//           <Box
//             sx={{
//               width: 4,
//               height: 20,
//               borderRadius: 2,
//               backgroundColor: "#2e7d32",
//             }}
//           />

//           <Typography
//             sx={{
//               fontSize: 16,
//               fontWeight: 700,
//               color: "#263238",
//             }}
//           >
//             Fee Summary - <span style={{ fontWeight: 400, color: "#5f6b76", }}>Enrolled Students</span>
//           </Typography>

//           {hasActiveFilters && (
//             <Chip
//               label="Filtered"
//               size="small"
//               sx={{
//                 ml: 0.5,
//                 height: 23,
//                 fontSize: 11,
//                 fontWeight: 600,
//                 backgroundColor: "#edf7ef",
//                 color: "#2e7d32",
//               }}
//             />
//           )}
//         </Box>

//         <Grid container spacing={2}>
//           {/* TOTAL FEE DEMAND */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Total Fee Demand"
//               value={
//                 feeSummary?.total_demand_amount ||
//                 0
//               }
//               icon={
//                 <CurrencyRupeeOutlinedIcon />
//               }
//               description="Total fee amount"
//               iconColor="#105c8e"
//               currency
//             />
//           </Grid>

//           {/* SEMESTER FEE PAID */}

//           {/* <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Semester Fee Paid"
//               value={
//                 feeSummary?.semester_fee_paid_amount ||
//                 0
//               }
//               icon={
//                 <PaymentsOutlinedIcon />
//               }
//               description="Semester fee collected"
//               iconColor="#2e7d32"
//               currency
//             />
//           </Grid> */}

//           {/* APPLICATION FEE */}

//           {/* <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Application Fee"
//               value={
//                 feeSummary?.application_fee_paid_amount ||
//                 0
//               }
//               icon={
//                 <ReceiptLongOutlinedIcon />
//               }
//               description="Application fee collected"
//               iconColor="#7b1fa2"
//               currency
//             />
//           </Grid> */}

//           {/* TOTAL PAID */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Total Paid"
//               value={
//                 feeSummary?.total_paid_amount ||
//                 0
//               }
//               icon={
//                 <AccountBalanceWalletOutlinedIcon />
//               }
//               description="Total amount collected"
//               iconColor="#00897b"
//               currency
//             />
//           </Grid>

//           {/* OUTSTANDING */}

//           <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//             <SummaryCard
//               title="Outstanding Amount"
//               value={
//                 feeSummary?.outstanding_amount ||
//                 0
//               }
//               icon={
//                 <MoneyOffCsredOutlinedIcon />
//               }
//               description="Amount yet to be collected"
//               iconColor="#c62828"
//               currency
//             />
//           </Grid>
//         </Grid>
//       </Box>

//       {/* ------------------------------------------------------------------ */}
//       {/* STUDENT TABLE                                                      */}
//       {/* ------------------------------------------------------------------ */}

//       <Card
//         sx={{
//           borderRadius: 3,
//           border: "1px solid #e6ebef",
//           boxShadow:
//             "0 2px 5px rgba(0,0,0,0.05)",
//           overflow: "hidden",
//         }}
//       >
//         {/* TABLE HEADER */}

//         <Box
//           sx={{
//             p: 2,
//             display: "flex",
//             flexDirection: {
//               xs: "column",
//               md: "row",
//             },
//             alignItems: {
//               xs: "stretch",
//               md: "center",
//             },
//             justifyContent:
//               "space-between",
//             gap: 1.5,
//           }}
//         >
//           <Box>
//             <Typography
//               sx={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: "#263238",
//               }}
//             >
//               Student Fee Details
//             </Typography>

//             <Typography
//               sx={{
//                 mt: 0.35,
//                 fontSize: 11.5,
//                 color: "#7b8794",
//               }}
//             >
//               {formatNumber(
//                 filteredStudents.length
//               )}{" "}
//               {filteredStudents.length ===
//                 1
//                 ? "student"
//                 : "students"}{" "}
//               displayed
//             </Typography>
//           </Box>

//           {/* SEARCH */}

//           <TextField
//             size="small"
//             placeholder="Search student, application no..."
//             value={search}
//             onChange={(event) => {
//               setSearch(
//                 event.target.value
//               );
//               setPage(0);
//             }}
//             sx={{
//               width: {
//                 xs: "100%",
//                 md: 300,
//               },

//               "& .MuiOutlinedInput-root":
//               {
//                 borderRadius: 2,
//                 fontSize: 13,
//                 backgroundColor:
//                   "#fafbfc",
//               },
//             }}
//             InputProps={{
//               startAdornment: (
//                 <SearchOutlinedIcon
//                   sx={{
//                     mr: 1,
//                     fontSize: 19,
//                     color: "#8a94a6",
//                   }}
//                 />
//               ),
//             }}
//           />
//         </Box>

//         <Divider />

//         {/* ERROR */}

//         {error && (
//           <Box
//             sx={{
//               p: 3,
//               textAlign: "center",
//             }}
//           >
//             <Typography
//               sx={{
//                 fontSize: 14,
//                 fontWeight: 600,
//                 color: "#BF2728",
//               }}
//             >
//               {error}
//             </Typography>

//             <Button
//               onClick={handleRefresh}
//               variant="outlined"
//               sx={{
//                 mt: 1.5,
//                 textTransform: "none",
//               }}
//             >
//               Try Again
//             </Button>
//           </Box>
//         )}

//         {/* LOADING */}

//         {!error && loading && (
//           <Box
//             sx={{
//               minHeight: 350,
//               display: "flex",
//               alignItems: "center",
//               justifyContent:
//                 "center",
//               flexDirection:
//                 "column",
//               gap: 1.5,
//             }}
//           >
//             <CircularProgress
//               size={32}
//               sx={{
//                 color: "#105c8e",
//               }}
//             />

//             <Typography
//               sx={{
//                 fontSize: 13,
//                 color: "#7b8794",
//               }}
//             >
//               Loading fee details...
//             </Typography>
//           </Box>
//         )}

//         {/* EMPTY */}

//         {!error &&
//           !loading &&
//           filteredStudents.length ===
//           0 && (
//             <Box
//               sx={{
//                 minHeight: 320,
//                 display: "flex",
//                 alignItems:
//                   "center",
//                 justifyContent:
//                   "center",
//                 flexDirection:
//                   "column",
//                 px: 3,
//               }}
//             >
//               <Box
//                 sx={{
//                   width: 58,
//                   height: 58,
//                   borderRadius:
//                     "50%",
//                   display: "flex",
//                   alignItems:
//                     "center",
//                   justifyContent:
//                     "center",
//                   backgroundColor:
//                     "#f2f6f8",
//                   color: "#8a99a5",
//                   mb: 1.5,
//                 }}
//               >
//                 <SearchOutlinedIcon />
//               </Box>

//               <Typography
//                 sx={{
//                   fontSize: 15,
//                   fontWeight: 600,
//                   color: "#39434d",
//                 }}
//               >
//                 No students found
//               </Typography>

//               <Typography
//                 sx={{
//                   mt: 0.5,
//                   fontSize: 12,
//                   color: "#7b8794",
//                   textAlign:
//                     "center",
//                 }}
//               >
//                 Try changing the
//                 filters or search
//                 criteria.
//               </Typography>
//             </Box>
//           )}

//         {/* TABLE */}

//         {!error &&
//           !loading &&
//           filteredStudents.length >
//           0 && (
//             <>
//               <TableContainer
//                 sx={{
//                   width: "100%",
//                   overflowX:
//                     "auto",
//                 }}
//               >
//                 <Table
//                   stickyHeader
//                   sx={{
//                     minWidth: 1500,
//                   }}
//                 >
//                   <TableHead>
//                     <TableRow>
//                       {/* S.NO */}

//                       <TableCell
//                         sx={{
//                           minWidth: 65,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         S.No
//                       </TableCell>

//                       {/* STUDENT */}

//                       <TableCell
//                         sx={{
//                           minWidth: 230,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Student
//                       </TableCell>

//                       {/* PROGRAM */}

//                       <TableCell
//                         sx={{
//                           minWidth: 190,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Program
//                       </TableCell>

//                       {/* BATCH */}

//                       <TableCell
//                         sx={{
//                           minWidth: 100,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                         }}
//                       >
//                         Batch
//                       </TableCell>

//                       {/* SEMESTER */}

//                       <TableCell
//                         sx={{
//                           minWidth: 115,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Semester
//                       </TableCell>

//                       {/* ADMISSION YEAR */}

//                       <TableCell
//                         sx={{
//                           minWidth: 115,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Admission Year
//                       </TableCell>

//                       {/* TOTAL FEE */}

//                       <TableCell
//                         align="right"
//                         sx={{
//                           minWidth: 130,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Total Fee
//                       </TableCell>

//                       {/* SEMESTER PAID */}

//                       <TableCell
//                         align="right"
//                         sx={{
//                           minWidth: 140,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Semester Paid
//                       </TableCell>

//                       {/* APPLICATION FEE */}

//                       <TableCell
//                         align="right"
//                         sx={{
//                           minWidth: 130,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Application Fee
//                       </TableCell>

//                       {/* TOTAL PAID */}

//                       <TableCell
//                         align="right"
//                         sx={{
//                           minWidth: 130,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Total Paid
//                       </TableCell>

//                       {/* OUTSTANDING */}

//                       <TableCell
//                         align="right"
//                         sx={{
//                           minWidth: 135,
//                           fontSize: 11.5,
//                           fontWeight: 700,
//                           color: "#46515c",
//                           backgroundColor:
//                             "#f7f9fa",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                       >
//                         Outstanding
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {paginatedStudents.map(
//                       (
//                         student,
//                         index
//                       ) => {
//                         const actualIndex =
//                           page *
//                           rowsPerPage +
//                           index;

//                         const isPaid =
//                           student.not_paid_amount <=
//                           0;

//                         return (
//                           <TableRow
//                             key={`${student.student_id}-${actualIndex}`}
//                             hover
//                             sx={{
//                               "&:last-child td":
//                               {
//                                 borderBottom: 0,
//                               },
//                             }}
//                           >
//                             {/* S.NO */}

//                             <TableCell
//                               sx={{
//                                 fontSize: 12,
//                                 color:
//                                   "#59636e",
//                               }}
//                             >
//                               {actualIndex +
//                                 1}
//                             </TableCell>

//                             {/* STUDENT */}

//                             <TableCell>
//                               <Box
//                                 sx={{
//                                   display:
//                                     "flex",
//                                   alignItems:
//                                     "center",
//                                   gap: 1.25,
//                                 }}
//                               >
//                                 <Box
//                                   sx={{
//                                     width: 36,
//                                     height: 36,
//                                     minWidth: 36,
//                                     borderRadius:
//                                       "50%",
//                                     display:
//                                       "flex",
//                                     alignItems:
//                                       "center",
//                                     justifyContent:
//                                       "center",
//                                     backgroundColor:
//                                       "#eaf4f9",
//                                     color:
//                                       "#105c8e",
//                                     fontWeight:
//                                       700,
//                                     fontSize:
//                                       13,
//                                   }}
//                                 >
//                                   {student.student_name
//                                     ?.charAt(
//                                       0
//                                     )
//                                     ?.toUpperCase() ||
//                                     "S"}
//                                 </Box>

//                                 <Box
//                                   sx={{
//                                     minWidth: 0,
//                                   }}
//                                 >
//                                   <Typography
//                                     sx={{
//                                       fontSize:
//                                         12.5,
//                                       fontWeight:
//                                         650,
//                                       color:
//                                         "#263238",
//                                       whiteSpace:
//                                         "nowrap",
//                                       overflow:
//                                         "hidden",
//                                       textOverflow:
//                                         "ellipsis",
//                                       maxWidth:
//                                         175,
//                                     }}
//                                   >
//                                     {student.student_name ||
//                                       "-"}
//                                   </Typography>

//                                   <Typography
//                                     sx={{
//                                       mt: 0.2,
//                                       fontSize:
//                                         10.5,
//                                       color:
//                                         "#7b8794",
//                                       whiteSpace:
//                                         "nowrap",
//                                     }}
//                                   >
//                                     App:{" "}
//                                     {student.application_no ||
//                                       "-"}
//                                   </Typography>

//                                   <Typography
//                                     sx={{
//                                       fontSize:
//                                         10.5,
//                                       color:
//                                         "#7b8794",
//                                       whiteSpace:
//                                         "nowrap",
//                                     }}
//                                   >
//                                     Reg:{" "}
//                                     {student.registration_no ||
//                                       "-"}
//                                   </Typography>
//                                 </Box>
//                               </Box>
//                             </TableCell>

//                             {/* PROGRAM */}

//                             <TableCell>
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     11.5,
//                                   fontWeight:
//                                     550,
//                                   color:
//                                     "#39434d",
//                                   maxWidth:
//                                     190,
//                                   lineHeight:
//                                     1.4,
//                                 }}
//                               >
//                                 {student.program_name ||
//                                   "-"}
//                               </Typography>
//                             </TableCell>

//                             {/* BATCH */}

//                             <TableCell>
//                               <Chip
//                                 label={
//                                   student.batch ||
//                                   "-"
//                                 }
//                                 size="small"
//                                 sx={{
//                                   height: 25,
//                                   fontSize:
//                                     10.5,
//                                   fontWeight:
//                                     600,
//                                   backgroundColor:
//                                     student.batch
//                                       ?.toLowerCase() ===
//                                       "july"
//                                       ? "#eaf4f9"
//                                       : "#fff4e5",
//                                   color:
//                                     student.batch
//                                       ?.toLowerCase() ===
//                                       "july"
//                                       ? "#105c8e"
//                                       : "#b25d00",
//                                 }}
//                               />
//                             </TableCell>

//                             {/* SEMESTER */}

//                             <TableCell>
//                               <Chip
//                                 label={
//                                   student.semester ||
//                                   "-"
//                                 }
//                                 size="small"
//                                 variant="outlined"
//                                 sx={{
//                                   height: 25,
//                                   fontSize:
//                                     10.5,
//                                   fontWeight:
//                                     550,
//                                   borderColor:
//                                     "#d6e0e6",
//                                   color:
//                                     "#52616d",
//                                 }}
//                               />
//                             </TableCell>

//                             {/* ADMISSION YEAR */}

//                             <TableCell>
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     11.5,
//                                   color:
//                                     "#52616d",
//                                   whiteSpace:
//                                     "nowrap",
//                                 }}
//                               >
//                                 {student.admission_year ||
//                                   "-"}
//                               </Typography>
//                             </TableCell>

//                             {/* TOTAL FEE */}

//                             <TableCell
//                               align="right"
//                             >
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     12,
//                                   fontWeight:
//                                     600,
//                                   color:
//                                     "#263238",
//                                   whiteSpace:
//                                     "nowrap",
//                                 }}
//                               >
//                                 {formatCurrency(
//                                   student.total_demand_amount
//                                 )}
//                               </Typography>
//                             </TableCell>

//                             {/* SEMESTER PAID */}

//                             <TableCell
//                               align="right"
//                             >
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     12,
//                                   color:
//                                     "#2e7d32",
//                                   fontWeight:
//                                     600,
//                                   whiteSpace:
//                                     "nowrap",
//                                 }}
//                               >
//                                 {formatCurrency(
//                                   student.semester_fee_paid_amount
//                                 )}
//                               </Typography>
//                             </TableCell>

//                             {/* APPLICATION FEE */}

//                             <TableCell
//                               align="right"
//                             >
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     12,
//                                   color:
//                                     "#7b1fa2",
//                                   fontWeight:
//                                     600,
//                                   whiteSpace:
//                                     "nowrap",
//                                 }}
//                               >
//                                 {formatCurrency(
//                                   student.application_fee_amount
//                                 )}
//                               </Typography>
//                             </TableCell>

//                             {/* TOTAL PAID */}

//                             <TableCell
//                               align="right"
//                             >
//                               <Typography
//                                 sx={{
//                                   fontSize:
//                                     12,
//                                   color:
//                                     "#00897b",
//                                   fontWeight:
//                                     700,
//                                   whiteSpace:
//                                     "nowrap",
//                                 }}
//                               >
//                                 {formatCurrency(
//                                   student.total_paid_amount
//                                 )}
//                               </Typography>
//                             </TableCell>

//                             {/* OUTSTANDING */}

//                             <TableCell
//                               align="right"
//                             >
//                               <Chip
//                                 label={
//                                   isPaid
//                                     ? "Paid"
//                                     : formatCurrency(
//                                       student.not_paid_amount
//                                     )
//                                 }
//                                 size="small"
//                                 sx={{
//                                   height: 27,
//                                   fontSize:
//                                     10.5,
//                                   fontWeight:
//                                     700,
//                                   backgroundColor:
//                                     isPaid
//                                       ? "#edf7ef"
//                                       : "#fff0f0",
//                                   color:
//                                     isPaid
//                                       ? "#2e7d32"
//                                       : "#c62828",
//                                 }}
//                               />
//                             </TableCell>
//                           </TableRow>
//                         );
//                       }
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               {/* PAGINATION */}

//               <Divider />

//               <TablePagination
//                 component="div"
//                 count={
//                   filteredStudents.length
//                 }
//                 page={page}
//                 onPageChange={(
//                   _,
//                   newPage
//                 ) =>
//                   setPage(newPage)
//                 }
//                 rowsPerPage={
//                   rowsPerPage
//                 }
//                 onRowsPerPageChange={(
//                   event
//                 ) => {
//                   setRowsPerPage(
//                     parseInt(
//                       event.target.value,
//                       10
//                     )
//                   );

//                   setPage(0);
//                 }}
//                 rowsPerPageOptions={[
//                   10,
//                   25,
//                   50,
//                   100,
//                 ]}
//                 sx={{
//                   "& .MuiTablePagination-toolbar":
//                   {
//                     minHeight: 52,
//                   },

//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
//                   {
//                     fontSize: 11.5,
//                     color:
//                       "#68737d",
//                   },
//                 }}
//               />
//             </>
//           )}
//       </Card>
//     </Box>
//   );
// };

// export default DashboardFees;



import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import MoneyOffCsredOutlinedIcon from "@mui/icons-material/MoneyOffCsredOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

import apiClient from "../../../../services/ApiClient";
import { ApiRoutes } from "../../../../constants/ApiConstants";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

interface Summary {
  total_enrolled_students: number;
  total_unenrolled_students: number;
  total_students: number;
  semester_fee_paid_amount: number;
  application_fee_amount: number;
  total_paid_amount: number;
}

interface FilteredSummary {
  total_enrolled_students: number;
  total_unenrolled_students: number;
  total_students: number;
}

interface FeeSummary {
  total_demand_amount: number;
  semester_fee_paid_amount: number;
  application_fee_paid_amount: number;
  total_paid_amount: number;
  outstanding_amount: number;
}

interface StudentFee {
  student_id: number;
  application_no: string;
  registration_no: string;
  student_name: string;
  program_name: string;
  batch: string;
  semester: string;
  admission_year: string;

  total_demand_amount: number;
  semester_fee_paid_amount: number;
  application_fee_amount: number;
  total_paid_amount: number;
  not_paid_amount: number;

  paid_semesters?: {
    semester: string;
    paid_amount: number;
  }[];
}

interface FeesDashboardResponse {
  summary: Summary;
  filtered_summary?: FilteredSummary | null;
  fee_summary: FeeSummary;
  total_students: number;
  students: StudentFee[];
}

/* -------------------------------------------------------------------------- */
/*                         PROGRAM / SEMESTER TYPES                           */
/* -------------------------------------------------------------------------- */

interface ProgramSemester {
  program_id: number;
  program_code: string;
  semester_no: number;
  semester_name: string;
  id: number;
}

interface ProgramOption {
  value: number;
  label: string;
  semesters: ProgramSemester[];
}

interface Filters {
  program_id: number[];
  batch: string[];
  semester: string[];
  admission_year: string[];
}

const initialFilters: Filters = {
  program_id: [],
  batch: [],
  semester: [],
  admission_year: [],
};

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

const DashboardFees: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<FeesDashboardResponse | null>(null);

  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  const [filters, setFilters] =
    useState<Filters>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [programLoading, setProgramLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  /* ------------------------------------------------------------------------ */
  /*                              FORMATTERS                                  */
  /* ------------------------------------------------------------------------ */

  const formatCurrency = (
    value: number | undefined | null
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (
    value: number | undefined | null
  ) => {
    return new Intl.NumberFormat("en-IN").format(
      value || 0
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                              FETCH PROGRAMS                               */
  /* ------------------------------------------------------------------------ */

  const fetchPrograms = async () => {
    try {
      setProgramLoading(true);

      const response = await apiClient.get(
        ApiRoutes.GETPROGRAMLIST
      );

      const mappedPrograms: ProgramOption[] =
        (response.data || []).map(
          (program: any) => ({
            value: Number(program.id),

            label: `${program.programe}${
              program.programe_code
                ? ` (${program.programe_code})`
                : ""
            }`,

            semesters: Array.isArray(
              program.semesters
            )
              ? program.semesters
                  .map((semester: any) => ({
                    program_id:
                      Number(
                        semester.program_id
                      ),

                    program_code:
                      semester.program_code,

                    semester_no:
                      Number(
                        semester.semester_no
                      ),

                    semester_name:
                      semester.semester_name,

                    id:
                      Number(
                        semester.id
                      ),
                  }))
                  .filter(
                    (semester: ProgramSemester) =>
                      semester.semester_no > 0
                  )
                  .sort(
                    (
                      a: ProgramSemester,
                      b: ProgramSemester
                    ) =>
                      a.semester_no -
                      b.semester_no
                  )
              : [],
          })
        );

      setPrograms(mappedPrograms);
    } catch (err) {
      console.error(
        "Failed to fetch programs",
        err
      );
    } finally {
      setProgramLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                    SELECTED PROGRAMS / SEMESTERS                         */
  /* ------------------------------------------------------------------------ */

  const selectedPrograms = useMemo(() => {
    return programs.filter((program) =>
      filters.program_id.includes(
        program.value
      )
    );
  }, [programs, filters.program_id]);

  /*
   * Build the semester list dynamically from
   * the currently selected programs.
   *
   * Example:
   *
   * Program A -> 1,2,3,4
   * Program B -> 1,2
   *
   * Result -> 1,2,3,4
   */

  const availableSemesters = useMemo(() => {
    if (
      filters.program_id.length === 0
    ) {
      return [];
    }

    const semesterMap =
      new Map<number, ProgramSemester>();

    selectedPrograms.forEach((program) => {
      program.semesters.forEach(
        (semester) => {
          if (
            !semesterMap.has(
              semester.semester_no
            )
          ) {
            semesterMap.set(
              semester.semester_no,
              semester
            );
          }
        }
      );
    });

    return Array.from(
      semesterMap.values()
    ).sort(
      (a, b) =>
        a.semester_no -
        b.semester_no
    );
  }, [
    filters.program_id,
    selectedPrograms,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                           FETCH DASHBOARD                                */
  /* ------------------------------------------------------------------------ */

  const fetchDashboard = async (
    selectedFilters: Filters = initialFilters
  ) => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, any> = {};

      if (
        selectedFilters.program_id.length >
        0
      ) {
        params.program_id =
          selectedFilters.program_id;
      }

      if (
        selectedFilters.batch.length > 0
      ) {
        params.batch =
          selectedFilters.batch;
      }

      if (
        selectedFilters.semester.length >
        0
      ) {
        params.semester =
          selectedFilters.semester;
      }

      if (
        selectedFilters.admission_year
          .length > 0
      ) {
        params.admission_year =
          selectedFilters.admission_year;
      }

      const response = await apiClient.get(
        ApiRoutes.DASHBOARD_FEES,
        {
          params,
          paramsSerializer: {
            indexes: null,
          },
        }
      );

      setDashboardData(response.data);

      setPage(0);
    } catch (err: any) {
      console.error(
        "Failed to fetch fees dashboard",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load fees dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                INITIAL                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchPrograms();
    fetchDashboard();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                            FILTER HANDLERS                               */
  /* ------------------------------------------------------------------------ */

  const handleFilterChange = (
    field: keyof Filters,
    value: string[] | number[]
  ) => {
    /*
     * When Program changes, recalculate the
     * valid semester options.
     *
     * This prevents a previously selected
     * semester from remaining selected when
     * the newly selected program does not have
     * that semester.
     */

    if (field === "program_id") {
      const selectedProgramIds =
        value as number[];

      const selectedProgramObjects =
        programs.filter((program) =>
          selectedProgramIds.includes(
            program.value
          )
        );

      const validSemesterNumbers =
        new Set<number>();

      selectedProgramObjects.forEach(
        (program) => {
          program.semesters.forEach(
            (semester) => {
              validSemesterNumbers.add(
                semester.semester_no
              );
            }
          );
        }
      );

      setFilters((prev) => ({
        ...prev,

        program_id:
          selectedProgramIds,

        semester:
          prev.semester.filter(
            (semester) => {
              const match =
                semester.match(
                  /(\d+)/
                );

              if (!match) {
                return false;
              }

              return validSemesterNumbers.has(
                Number(match[1])
              );
            }
          ),
      }));

      return;
    }

    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    fetchDashboard(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSearch("");

    fetchDashboard(initialFilters);
  };

  const handleRefresh = () => {
    fetchDashboard(appliedFilters);
  };

  /* ------------------------------------------------------------------------ */
  /*                          ACTIVE FILTERS                                  */
  /* ------------------------------------------------------------------------ */

  const hasActiveFilters = useMemo(() => {
    return Object.values(appliedFilters).some(
      (value) => value.length > 0
    );
  }, [appliedFilters]);

  /* ------------------------------------------------------------------------ */
  /*                         FILTERED STUDENTS                                */
  /* ------------------------------------------------------------------------ */

  const filteredStudents = useMemo(() => {
    if (!dashboardData?.students) {
      return [];
    }

    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return dashboardData.students;
    }

    return dashboardData.students.filter(
      (student) => {
        return (
          student.student_name
            ?.toLowerCase()
            .includes(searchValue) ||
          student.application_no
            ?.toLowerCase()
            .includes(searchValue) ||
          student.registration_no
            ?.toLowerCase()
            .includes(searchValue) ||
          student.program_name
            ?.toLowerCase()
            .includes(searchValue) ||
          student.batch
            ?.toLowerCase()
            .includes(searchValue) ||
          student.semester
            ?.toLowerCase()
            .includes(searchValue) ||
          student.admission_year
            ?.toLowerCase()
            .includes(searchValue)
        );
      }
    );
  }, [
    dashboardData?.students,
    search,
  ]);

  const paginatedStudents = useMemo(() => {
    const startIndex =
      page * rowsPerPage;

    return filteredStudents.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [
    filteredStudents,
    page,
    rowsPerPage,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                         APPLIED PROGRAMS                                 */
  /* ------------------------------------------------------------------------ */

  const appliedSelectedPrograms =
    useMemo(() => {
      return programs.filter((program) =>
        appliedFilters.program_id.includes(
          program.value
        )
      );
    }, [
      programs,
      appliedFilters.program_id,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                              SUMMARY DATA                                */
  /* ------------------------------------------------------------------------ */

  const summary = dashboardData?.summary;

  const filteredSummary =
    dashboardData?.filtered_summary;

  const feeSummary =
    dashboardData?.fee_summary;

  /* ------------------------------------------------------------------------ */
  /*                             SUMMARY CARD                                */
  /* ------------------------------------------------------------------------ */

  const SummaryCard = ({
    title,
    value,
    icon,
    description,
    iconColor = "#105c8e",
    currency = false,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description?: string;
    iconColor?: string;
    currency?: boolean;
  }) => {
    return (
      <Card
        sx={{
          height: "100%",
          borderRadius: 3,
          border: "1px solid #e8edf2",
          boxShadow:
            "0 2px 5px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease",

          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 5px 14px rgba(0,0,0,0.08)",
          },
        }}
      >
        <Box sx={{ p: 2.25 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#6b7280",
                  mb: 0.8,
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 22,
                    sm: 24,
                  },
                  fontWeight: 700,
                  color: "#17212b",
                  lineHeight: 1.2,
                }}
              >
                {currency
                  ? formatCurrency(value)
                  : formatNumber(value)}
              </Typography>

              {description && (
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 11.5,
                    color: "#8a94a6",
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${iconColor}12`,
                color: iconColor,
              }}
            >
              {icon}
            </Box>
          </Stack>
        </Box>
      </Card>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                              PAGE CONTENT                                */
  /* ------------------------------------------------------------------------ */

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        pb: 4,
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* PAGE HEADER                                                         */}
      {/* ------------------------------------------------------------------ */}

      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent:
            "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 21,
                sm: 24,
              },
              fontWeight: 700,
              color: "#17212b",
            }}
          >
            Fee Dashboard
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Monitor student fee collections,
            payments and outstanding amounts.
          </Typography>
        </Box>

        <Tooltip title="Refresh dashboard">
          <IconButton
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #dce3e8",
              borderRadius: 2,
              color: "#105c8e",
              backgroundColor: "#fff",

              "&:hover": {
                backgroundColor:
                  "#f4f8fb",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={19} />
            ) : (
              <RefreshOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* OVERALL SUMMARY                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 20,
              borderRadius: 2,
              backgroundColor: "#105c8e",
            }}
          />

          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: "#263238",
            }}
          >
            Overall Summary
          </Typography>

          <Chip
            label="All Students"
            size="small"
            sx={{
              ml: 0.5,
              height: 23,
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: "#eef6fb",
              color: "#105c8e",
            }}
          />
        </Box>

        <Grid container spacing={2}>
          {/* ENROLLED STUDENTS */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Enrolled Students"
              value={
                summary?.total_enrolled_students ||
                0
              }
              icon={
                <SchoolOutlinedIcon />
              }
              description="Students currently enrolled"
              iconColor="#1976d2"
            />
          </Grid>

          {/* UNENROLLED STUDENTS */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Unenrolled Students"
              value={
                summary?.total_unenrolled_students ||
                0
              }
              icon={
                <PersonOffOutlinedIcon />
              }
              description="Students not yet enrolled (only paid application fees)"
              iconColor="#ed6c02"
            />
          </Grid>

          {/* TOTAL PAID */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Total Paid"
              value={
                summary?.total_paid_amount || 0
              }
              icon={
                <AccountBalanceWalletOutlinedIcon />
              }
              description="Total amount collected"
              iconColor="#00897b"
              currency
            />
          </Grid>
        </Grid>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* FILTERED SUMMARY                                                   */}
      {/* ------------------------------------------------------------------ */}

      {hasActiveFilters &&
        filteredSummary && (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: "1px solid #d9e8f2",
              background:
                "linear-gradient(135deg, #f7fbfe 0%, #ffffff 100%)",
              boxShadow:
                "0 2px 5px rgba(0,0,0,0.04)",
            }}
          >
            <Box sx={{ p: 2.25 }}>
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  md: "center",
                }}
                spacing={2}
              >
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 0.6 }}
                  >
                    <TrendingUpOutlinedIcon
                      sx={{
                        fontSize: 20,
                        color: "#105c8e",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#263238",
                      }}
                    >
                      Filtered Results
                    </Typography>

                    <Chip
                      label={`${formatNumber(
                        filteredSummary.total_students
                      )} Students`}
                      size="small"
                      sx={{
                        height: 23,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#105c8e",
                        backgroundColor:
                          "#e7f3fa",
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#718096",
                    }}
                  >
                    Showing student counts based on
                    the selected filters.
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {appliedSelectedPrograms.map(
                    (program) => (
                      <Chip
                        key={program.value}
                        label={`Program: ${program.label}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: 11,
                          borderColor:
                            "#c9dce8",
                          color: "#105c8e",
                        }}
                      />
                    )
                  )}

                  {appliedFilters.batch.length >
                    0 && (
                    <Chip
                      label={`Batch: ${appliedFilters.batch.join(
                        ", "
                      )}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 11,
                        borderColor:
                          "#c9dce8",
                        color: "#105c8e",
                      }}
                    />
                  )}

                  {appliedFilters.semester.length >
                    0 && (
                    <Chip
                      label={`Semester: ${appliedFilters.semester
                        .map(
                          (semester) =>
                            semester.replace(
                              /^semester\s*/i,
                              "Semester "
                            )
                        )
                        .join(", ")}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 11,
                        borderColor:
                          "#c9dce8",
                        color: "#105c8e",
                      }}
                    />
                  )}

                  {appliedFilters.admission_year
                    .length > 0 && (
                    <Chip
                      label={`Year: ${appliedFilters.admission_year.join(
                        ", "
                      )}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 11,
                        borderColor:
                          "#c9dce8",
                        color: "#105c8e",
                      }}
                    />
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {/* FILTERED STUDENTS */}

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      border:
                        "1px solid #edf1f4",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#7b8794",
                      }}
                    >
                      Filtered Students
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#17212b",
                      }}
                    >
                      {formatNumber(
                        filteredSummary.total_students
                      )}
                    </Typography>
                  </Box>
                </Grid>

                {/* ENROLLED */}

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      border:
                        "1px solid #edf1f4",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#7b8794",
                      }}
                    >
                      Enrolled
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#2e7d32",
                      }}
                    >
                      {formatNumber(
                        filteredSummary.total_enrolled_students
                      )}
                    </Typography>
                  </Box>
                </Grid>

                {/* UNENROLLED */}

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      border:
                        "1px solid #edf1f4",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#7b8794",
                      }}
                    >
                      Unenrolled
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#ed6c02",
                      }}
                    >
                      {formatNumber(
                        filteredSummary.total_unenrolled_students
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        )}

      {/* ------------------------------------------------------------------ */}
      {/* FILTER CARD                                                        */}
      {/* ------------------------------------------------------------------ */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e6ebef",
          boxShadow:
            "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ p: 2.25 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <FilterAltOutlinedIcon
              sx={{
                color: "#105c8e",
                fontSize: 21,
              }}
            />

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "#263238",
              }}
            >
              Filters
            </Typography>

            {hasActiveFilters && (
              <Chip
                label="Active"
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10.5,
                  fontWeight: 700,
                  backgroundColor: "#e8f3f9",
                  color: "#105c8e",
                }}
              />
            )}
          </Stack>

          <Grid container spacing={2}>
            {/* PROGRAM */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Program
                </InputLabel>

                <Select
                  multiple
                  value={filters.program_id}
                  label="Program"
                  onChange={(event) =>
                    handleFilterChange(
                      "program_id",
                      (
                        event.target.value as (
                          | string
                          | number
                        )[]
                      ).map(Number)
                    )
                  }
                  renderValue={(selected) => {
                    const selectedIds =
                      selected as number[];

                    if (
                      selectedIds.length ===
                      0
                    ) {
                      return "All Programs";
                    }

                    return programs
                      .filter((program) =>
                        selectedIds.includes(
                          program.value
                        )
                      )
                      .map(
                        (program) =>
                          program.label
                      )
                      .join(", ");
                  }}
                >
                  {programLoading ? (
                    <MenuItem disabled>
                      Loading programs...
                    </MenuItem>
                  ) : (
                    programs.map((program) => (
                      <MenuItem
                        key={program.value}
                        value={program.value}
                      >
                        <Checkbox
                          size="small"
                          checked={filters.program_id.includes(
                            program.value
                          )}
                        />

                        <ListItemText
                          primary={
                            program.label
                          }
                        />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* BATCH */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Batch
                </InputLabel>

                <Select
                  multiple
                  value={filters.batch}
                  label="Batch"
                  onChange={(event) =>
                    handleFilterChange(
                      "batch",
                      event.target.value as string[]
                    )
                  }
                  renderValue={(selected) => {
                    const values =
                      selected as string[];

                    return values.length === 0
                      ? "All Batches"
                      : values.join(", ");
                  }}
                >
                  {[
                    "January",
                    "July",
                  ].map((batch) => (
                    <MenuItem
                      key={batch}
                      value={batch}
                    >
                      <Checkbox
                        size="small"
                        checked={filters.batch.includes(
                          batch
                        )}
                      />

                      <ListItemText
                        primary={batch}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* SEMESTER */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Semester
                </InputLabel>

                <Select
                  multiple
                  value={filters.semester}
                  label="Semester"
                  disabled={
                    filters.program_id.length ===
                    0
                  }
                  onChange={(event) =>
                    handleFilterChange(
                      "semester",
                      event.target.value as string[]
                    )
                  }
                  renderValue={(selected) => {
                    const values =
                      selected as string[];

                    return values.length === 0
                      ? "All Semesters"
                      : values
                          .map(
                            (value) =>
                              value.replace(
                                /^semester\s*/i,
                                "Semester "
                              )
                          )
                          .join(", ");
                  }}
                >
                  {filters.program_id.length ===
                  0 ? (
                    <MenuItem disabled>
                      Select a program first
                    </MenuItem>
                  ) : availableSemesters.length ===
                    0 ? (
                    <MenuItem disabled>
                      No semesters available
                    </MenuItem>
                  ) : (
                    availableSemesters.map(
                      (semester) => {
                        const value = `semester ${semester.semester_no}`;

                        return (
                          <MenuItem
                            key={semester.id}
                            value={value}
                          >
                            <Checkbox
                              size="small"
                              checked={filters.semester.includes(
                                value
                              )}
                            />

                            <ListItemText
                              primary={
                                semester.semester_name ||
                                `Semester ${semester.semester_no}`
                              }
                            />
                          </MenuItem>
                        );
                      }
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* ADMISSION YEAR */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Admission Year
                </InputLabel>

                <Select
                  multiple
                  value={
                    filters.admission_year
                  }
                  label="Admission Year"
                  onChange={(event) =>
                    handleFilterChange(
                      "admission_year",
                      event.target.value as string[]
                    )
                  }
                  renderValue={(selected) => {
                    const values =
                      selected as string[];

                    return values.length === 0
                      ? "All Admission Years"
                      : values.join(", ");
                  }}
                >
                  {[
                    "2025-2026",
                    "2026-2027",
                    "2027-2028",
                  ].map((year) => (
                    <MenuItem
                      key={year}
                      value={year}
                    >
                      <Checkbox
                        size="small"
                        checked={filters.admission_year.includes(
                          year
                        )}
                      />

                      <ListItemText
                        primary={year}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* FILTER BUTTONS */}

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1.25}
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={
                <ClearOutlinedIcon />
              }
              onClick={
                handleClearFilters
              }
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#d2d9df",
                color: "#5f6b76",
                px: 2,

                "&:hover": {
                  borderColor: "#aeb8c1",
                  backgroundColor:
                    "#f7f8f9",
                },
              }}
            >
              Clear
            </Button>

            <Button
              variant="contained"
              startIcon={
                <FilterAltOutlinedIcon />
              }
              onClick={
                handleApplyFilters
              }
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
                backgroundColor:
                  "#105c8e",
                boxShadow: "none",

                "&:hover": {
                  backgroundColor:
                    "#0d4d76",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={18}
                  sx={{
                    color: "#fff",
                  }}
                />
              ) : (
                "Apply Filters"
              )}
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* FEE SUMMARY                                                        */}
      {/* ------------------------------------------------------------------ */}

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 20,
              borderRadius: 2,
              backgroundColor: "#2e7d32",
            }}
          />

          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: "#263238",
            }}
          >
            Fee Summary -{" "}
            <span
              style={{
                fontWeight: 400,
                color: "#5f6b76",
              }}
            >
              Enrolled Students
            </span>
          </Typography>

          {hasActiveFilters && (
            <Chip
              label="Filtered"
              size="small"
              sx={{
                ml: 0.5,
                height: 23,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: "#edf7ef",
                color: "#2e7d32",
              }}
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* TOTAL FEE DEMAND */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Total Fee Demand"
              value={
                feeSummary?.total_demand_amount ||
                0
              }
              icon={
                <CurrencyRupeeOutlinedIcon />
              }
              description="Total fee amount"
              iconColor="#105c8e"
              currency
            />
          </Grid>

          {/* TOTAL PAID */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Total Paid"
              value={
                feeSummary?.total_paid_amount ||
                0
              }
              icon={
                <AccountBalanceWalletOutlinedIcon />
              }
              description="Total amount collected"
              iconColor="#00897b"
              currency
            />
          </Grid>

          {/* OUTSTANDING */}

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <SummaryCard
              title="Outstanding Amount"
              value={
                feeSummary?.outstanding_amount ||
                0
              }
              icon={
                <MoneyOffCsredOutlinedIcon />
              }
              description="Amount yet to be collected"
              iconColor="#c62828"
              currency
            />
          </Grid>
        </Grid>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* STUDENT TABLE                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #e6ebef",
          boxShadow:
            "0 2px 5px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* TABLE HEADER */}

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            justifyContent:
              "space-between",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "#263238",
              }}
            >
              Student Fee Details
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: 11.5,
                color: "#7b8794",
              }}
            >
              {formatNumber(
                filteredStudents.length
              )}{" "}
              {filteredStudents.length ===
              1
                ? "student"
                : "students"}{" "}
              displayed
            </Typography>
          </Box>

          {/* SEARCH */}

          <TextField
            size="small"
            placeholder="Search student, application no..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(0);
            }}
            sx={{
              width: {
                xs: "100%",
                md: 300,
              },

              "& .MuiOutlinedInput-root":
                {
                  borderRadius: 2,
                  fontSize: 13,
                  backgroundColor:
                    "#fafbfc",
                },
            }}
            InputProps={{
              startAdornment: (
                <SearchOutlinedIcon
                  sx={{
                    mr: 1,
                    fontSize: 19,
                    color: "#8a94a6",
                  }}
                />
              ),
            }}
          />
        </Box>

        <Divider />

        {/* ERROR */}

        {error && (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#BF2728",
              }}
            >
              {error}
            </Typography>

            <Button
              onClick={handleRefresh}
              variant="outlined"
              sx={{
                mt: 1.5,
                textTransform: "none",
              }}
            >
              Try Again
            </Button>
          </Box>
        )}

        {/* LOADING */}

        {!error && loading && (
          <Box
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              gap: 1.5,
            }}
          >
            <CircularProgress
              size={32}
              sx={{
                color: "#105c8e",
              }}
            />

            <Typography
              sx={{
                fontSize: 13,
                color: "#7b8794",
              }}
            >
              Loading fee details...
            </Typography>
          </Box>
        )}

        {/* EMPTY */}

        {!error &&
          !loading &&
          filteredStudents.length ===
            0 && (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                flexDirection:
                  "column",
                px: 3,
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius:
                    "50%",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  backgroundColor:
                    "#f2f6f8",
                  color: "#8a99a5",
                  mb: 1.5,
                }}
              >
                <SearchOutlinedIcon />
              </Box>

              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#39434d",
                }}
              >
                No students found
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12,
                  color: "#7b8794",
                  textAlign:
                    "center",
                }}
              >
                Try changing the
                filters or search
                criteria.
              </Typography>
            </Box>
          )}

        {/* TABLE */}

        {!error &&
          !loading &&
          filteredStudents.length >
            0 && (
            <>
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX:
                    "auto",
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 1500,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {/* S.NO */}

                      <TableCell
                        sx={{
                          minWidth: 65,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        S.No
                      </TableCell>

                      {/* STUDENT */}

                      <TableCell
                        sx={{
                          minWidth: 230,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Student
                      </TableCell>

                      {/* PROGRAM */}

                      <TableCell
                        sx={{
                          minWidth: 190,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Program
                      </TableCell>

                      {/* BATCH */}

                      <TableCell
                        sx={{
                          minWidth: 100,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                        }}
                      >
                        Batch
                      </TableCell>

                      {/* SEMESTER */}

                      <TableCell
                        sx={{
                          minWidth: 115,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Semester
                      </TableCell>

                      {/* ADMISSION YEAR */}

                      <TableCell
                        sx={{
                          minWidth: 115,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Admission Year
                      </TableCell>

                      {/* TOTAL FEE */}

                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 130,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Total Fee
                      </TableCell>

                      {/* SEMESTER PAID */}

                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 140,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Semester Paid
                      </TableCell>

                      {/* APPLICATION FEE */}

                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 130,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Application Fee
                      </TableCell>

                      {/* TOTAL PAID */}

                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 130,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Total Paid
                      </TableCell>

                      {/* OUTSTANDING */}

                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 135,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#46515c",
                          backgroundColor:
                            "#f7f9fa",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Outstanding
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedStudents.map(
                      (
                        student,
                        index
                      ) => {
                        const actualIndex =
                          page *
                            rowsPerPage +
                          index;

                        const isPaid =
                          student.not_paid_amount <=
                          0;

                        return (
                          <TableRow
                            key={`${student.student_id}-${actualIndex}`}
                            hover
                            sx={{
                              "&:last-child td":
                                {
                                  borderBottom: 0,
                                },
                            }}
                          >
                            {/* S.NO */}

                            <TableCell
                              sx={{
                                fontSize: 12,
                                color:
                                  "#59636e",
                              }}
                            >
                              {actualIndex +
                                1}
                            </TableCell>

                            {/* STUDENT */}

                            <TableCell>
                              <Box
                                sx={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: 1.25,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    minWidth: 36,
                                    borderRadius:
                                      "50%",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    backgroundColor:
                                      "#eaf4f9",
                                    color:
                                      "#105c8e",
                                    fontWeight:
                                      700,
                                    fontSize:
                                      13,
                                  }}
                                >
                                  {student.student_name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                    "S"}
                                </Box>

                                <Box
                                  sx={{
                                    minWidth: 0,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        12.5,
                                      fontWeight:
                                        650,
                                      color:
                                        "#263238",
                                      whiteSpace:
                                        "nowrap",
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                      maxWidth:
                                        175,
                                    }}
                                  >
                                    {student.student_name ||
                                      "-"}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.2,
                                      fontSize:
                                        10.5,
                                      color:
                                        "#7b8794",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    App:{" "}
                                    {student.application_no ||
                                      "-"}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize:
                                        10.5,
                                      color:
                                        "#7b8794",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    Reg:{" "}
                                    {student.registration_no ||
                                      "-"}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* PROGRAM */}

                            <TableCell>
                              <Typography
                                sx={{
                                  fontSize:
                                    11.5,
                                  fontWeight:
                                    550,
                                  color:
                                    "#39434d",
                                  maxWidth:
                                    190,
                                  lineHeight:
                                    1.4,
                                }}
                              >
                                {student.program_name ||
                                  "-"}
                              </Typography>
                            </TableCell>

                            {/* BATCH */}

                            <TableCell>
                              <Chip
                                label={
                                  student.batch ||
                                  "-"
                                }
                                size="small"
                                sx={{
                                  height: 25,
                                  fontSize:
                                    10.5,
                                  fontWeight:
                                    600,
                                  backgroundColor:
                                    student.batch
                                      ?.toLowerCase() ===
                                    "july"
                                      ? "#eaf4f9"
                                      : "#fff4e5",
                                  color:
                                    student.batch
                                      ?.toLowerCase() ===
                                    "july"
                                      ? "#105c8e"
                                      : "#b25d00",
                                }}
                              />
                            </TableCell>

                            {/* SEMESTER */}

                            <TableCell>
                              <Chip
                                label={
                                  student.semester ||
                                  "-"
                                }
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 25,
                                  fontSize:
                                    10.5,
                                  fontWeight:
                                    550,
                                  borderColor:
                                    "#d6e0e6",
                                  color:
                                    "#52616d",
                                }}
                              />
                            </TableCell>

                            {/* ADMISSION YEAR */}

                            <TableCell>
                              <Typography
                                sx={{
                                  fontSize:
                                    11.5,
                                  color:
                                    "#52616d",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {student.admission_year ||
                                  "-"}
                              </Typography>
                            </TableCell>

                            {/* TOTAL FEE */}

                            <TableCell align="right">
                              <Typography
                                sx={{
                                  fontSize:
                                    12,
                                  fontWeight:
                                    600,
                                  color:
                                    "#263238",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {formatCurrency(
                                  student.total_demand_amount
                                )}
                              </Typography>
                            </TableCell>

                            {/* SEMESTER PAID */}

                            <TableCell align="right">
                              <Typography
                                sx={{
                                  fontSize:
                                    12,
                                  color:
                                    "#2e7d32",
                                  fontWeight:
                                    600,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {formatCurrency(
                                  student.semester_fee_paid_amount
                                )}
                              </Typography>
                            </TableCell>

                            {/* APPLICATION FEE */}

                            <TableCell align="right">
                              <Typography
                                sx={{
                                  fontSize:
                                    12,
                                  color:
                                    "#7b1fa2",
                                  fontWeight:
                                    600,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {formatCurrency(
                                  student.application_fee_amount
                                )}
                              </Typography>
                            </TableCell>

                            {/* TOTAL PAID */}

                            <TableCell align="right">
                              <Typography
                                sx={{
                                  fontSize:
                                    12,
                                  color:
                                    "#00897b",
                                  fontWeight:
                                    700,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {formatCurrency(
                                  student.total_paid_amount
                                )}
                              </Typography>
                            </TableCell>

                            {/* OUTSTANDING */}

                            <TableCell align="right">
                              <Chip
                                label={
                                  isPaid
                                    ? "Paid"
                                    : formatCurrency(
                                        student.not_paid_amount
                                      )
                                }
                                size="small"
                                sx={{
                                  height: 27,
                                  fontSize:
                                    10.5,
                                  fontWeight:
                                    700,
                                  backgroundColor:
                                    isPaid
                                      ? "#edf7ef"
                                      : "#fff0f0",
                                  color:
                                    isPaid
                                      ? "#2e7d32"
                                      : "#c62828",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* PAGINATION */}

              <Divider />

              <TablePagination
                component="div"
                count={
                  filteredStudents.length
                }
                page={page}
                onPageChange={(
                  _,
                  newPage
                ) =>
                  setPage(newPage)
                }
                rowsPerPage={
                  rowsPerPage
                }
                onRowsPerPageChange={(
                  event
                ) => {
                  setRowsPerPage(
                    parseInt(
                      event.target.value,
                      10
                    )
                  );

                  setPage(0);
                }}
                rowsPerPageOptions={[
                  10,
                  25,
                  50,
                  100,
                ]}
                sx={{
                  "& .MuiTablePagination-toolbar":
                    {
                      minHeight: 52,
                    },

                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      fontSize: 11.5,
                      color:
                        "#68737d",
                    },
                }}
              />
            </>
          )}
      </Card>
    </Box>
  );
};

export default DashboardFees;
