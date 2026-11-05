
import * as React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PaymentsIcon from "@mui/icons-material/Payments";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  IconButton,
} from "@mui/material";

import CardComponent from "../../../components/card/Card";
import ReusableTable from "../../../components/table/table";
import TableToolbar from "../../../components/tabletoolbar/tableToolbar";
import TablePagination from "../../../components/tablepagination/tablepagination";
import TableSkeleton from "../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../components/card/errorUi/NoDataFoundUI";

import { exportToExcel } from "../../../constants/excelExport";
import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes } from "../../../constants/ApiConstants";
import { useGlobalError } from "../../../context/ErrorContext";
import { useAlert } from "../../../context/AlertContext";
import { useLoader } from "../../../context/LoaderContext";

// Types

interface SeminarPayment {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: string;
  currency: string;
  payment_status: string;
  created_at: string;
}

interface SeminarRegistration {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  professional_category: string;
  seminar_track: string;
  presenting_paper: boolean;
  city_district: string;
  registration_status: string;
  created_at: string;
  payments: SeminarPayment[];
}

interface SeminarTableRow extends SeminarRegistration {
  sno: number;
  payment_status: string;
  registered_on: string;
  search_text: string;
}

export default function SeminarRegistrationList() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);
  const [searchText, setSearchText] = React.useState("");

  const [registrations, setRegistrations] = React.useState<
    SeminarRegistration[]
  >([]);

  const [selectedRegistration, setSelectedRegistration] =
    React.useState<SeminarRegistration | null>(null);

  const [openDetails, setOpenDetails] = React.useState(false);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  const { clearError } = useGlobalError();
  const { loading } = useLoader();
  const { showAlert } = useAlert();

  // Date format
  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch Seminar Registrations
  React.useEffect(() => {
    clearError();

    apiRequest({
      url: ApiRoutes.GETSEMINARLIST,
      method: "get",
    })
      .then((data) => {
        const result = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setRegistrations(result);
      })
      .catch((err: any) => {
        setRegistrations([]);

        showAlert(
          err.response?.data?.message ||
            "Failed to fetch seminar registrations.",
          "error"
        );
      });
  }, []);

  // Prepare table data
  const formattedData: SeminarTableRow[] = registrations.map(
    (item, index) => ({
      ...item,
      sno: index + 1,

      payment_status:
        item.payments?.length > 0
          ? item.payments[item.payments.length - 1].payment_status
          : "No Payment",

      registered_on: formatDate(item.created_at),

      search_text: [
        item.id,
        item.full_name,
        item.email,
        item.mobile,
        item.professional_category,
        item.seminar_track,
        item.city_district,
        item.registration_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  );

  // Search
  const filteredRegistrations = formattedData.filter((item) =>
    item.search_text.includes(searchText.toLowerCase().trim())
  );

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel(
      filteredRegistrations,
      [
        { header: "S.No", key: "sno" },
        { header: "Registration ID", key: "id" },
        { header: "Full Name", key: "full_name" },
        { header: "Email", key: "email" },
        { header: "Mobile", key: "mobile" },
        {
          header: "Professional Category",
          key: "professional_category",
        },
        { header: "Seminar Track", key: "seminar_track" },
        {
          header: "Presenting Paper",
          key: "presenting_paper",
        },
        { header: "City / District", key: "city_district" },
        {
          header: "Registration Status",
          key: "registration_status",
        },
        {
          header: "Payment Status",
          key: "payment_status",
        },
        { header: "Registered On", key: "registered_on" },
      ],
      "Seminar",
      "Seminar_Registrations"
    );
  };

  // Get Registration Details By ID
  const handleViewDetails = async (row: SeminarRegistration) => {
    setSelectedRegistration(null);
    setOpenDetails(true);
    setDetailsLoading(true);

    try {
      const data = await apiRequest({
        url: ApiRoutes.SEMINAR_GET_BY_ID(row.id),
        method: "get",
      });

      const result = data?.data || data;

      setSelectedRegistration(result);
    } catch (err: any) {
      showAlert(
        err.response?.data?.message ||
          "Failed to fetch seminar registration details.",
        "error"
      );

      setOpenDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedRegistration(null);
  };

  // Status Color
  const getStatusColor = (
    status?: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "paid":
        return "success";

      case "pending":
        return "warning";

      case "failed":
      case "cancelled":
        return "error";

      default:
        return "default";
    }
  };

  // Reusable Detail Field
  const DetailField = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <Box
      sx={{
        width: {
          xs: "100%",
          sm: "calc(50% - 12px)",
        },
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ overflowWrap: "anywhere" }}
      >
        {value !== undefined && value !== null && value !== ""
          ? value
          : "-"}
      </Typography>
    </Box>
  );

  return (
    <>
      <CardComponent
        sx={{
          width: "100%",
          maxWidth: {
            xs: "350px",
            sm: "900px",
            md: "1300px",
          },
          mx: "auto",
          p: 3,
          mt: 3,
        }}
      >
        {/* Toolbar */}
        <TableToolbar
          filters={[
            {
              key: "search",
              label: "Search",
              type: "text",
              value: searchText,
              onChange: (val) => {
                setSearchText(val);
                setPage(0);
              },
              placeholder: "Search by name, email, mobile, track...",
              visible: true,
            },
          ]}
          actions={[
            {
              label: "Export Excel",
              color: "secondary",
              startIcon: <FileDownloadIcon />,
              onClick: handleExportExcel,
            },
          ]}
        />

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            {filteredRegistrations.length === 0 ? (
              <NoDataFoundUI />
            ) : (
              <ReusableTable
                columns={[
                  { key: "id", label: "Registration ID" },
                  { key: "full_name", label: "Participant Name" },
                  { key: "email", label: "Email" },
                  { key: "mobile", label: "Mobile" },
                  {
                    key: "seminar_track",
                    label: "Seminar Track",
                  },
                  {
                    key: "registration_status",
                    label: "Registration Status",
                  },
                  {
                    key: "payment_status",
                    label: "Payment Status",
                  },
                  {
                    key: "registered_on",
                    label: "Registered On",
                  },
                ]}
                data={filteredRegistrations}
                page={page}
                rowsPerPage={rowsPerPage}
                actions={[
                  {
                    label: "View Details",
                    icon: <VisibilityIcon fontSize="small" />,
                    color: "primary",
                    onClick: (row) => handleViewDetails(row),
                  },
                ]}
              />
            )}
          </>
        )}

        {/* Pagination */}
        <TablePagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRegistrations.length}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </CardComponent>

      {/* Registration Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Seminar Registration Details
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Registration ID: {selectedRegistration?.id ?? "-"}
            </Typography>
          </Box>

          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : selectedRegistration ? (
            <>
              {/* Participant Information */}
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Participant Information
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 3,
                  rowGap: 2.5,
                }}
              >
                <DetailField
                  label="Full Name"
                  value={selectedRegistration.full_name}
                />

                <DetailField
                  label="Email"
                  value={selectedRegistration.email}
                />

                <DetailField
                  label="Mobile"
                  value={selectedRegistration.mobile}
                />

                <DetailField
                  label="Professional Category"
                  value={selectedRegistration.professional_category}
                />

                <DetailField
                  label="City / District"
                  value={selectedRegistration.city_district}
                />

                <DetailField
                  label="Seminar Track"
                  value={selectedRegistration.seminar_track}
                />

                <DetailField
                  label="Presenting Paper"
                  value={selectedRegistration.presenting_paper ? "Yes" : "No"}
                />

                <DetailField
                  label="Registered On"
                  value={formatDate(selectedRegistration.created_at)}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Registration Status */}
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Registration Status
              </Typography>

              <Chip
                label={
                  selectedRegistration.registration_status || "Unknown"
                }
                color={getStatusColor(
                  selectedRegistration.registration_status
                )}
              />

              <Divider sx={{ my: 3 }} />

              {/* Payment History */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={2}
              >
                <PaymentsIcon color="primary" />

                <Typography variant="subtitle1" fontWeight={700}>
                  Payment History
                </Typography>
              </Stack>

              {selectedRegistration.payments?.length > 0 ? (
                selectedRegistration.payments.map((payment) => (
                  <Paper
                    key={payment.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        columnGap: 3,
                        rowGap: 2,
                      }}
                    >
                      <DetailField
                        label="Amount"
                        value={`${payment.currency || "INR"} ${
                          payment.amount || "-"
                        }`}
                      />

                      <Box
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "calc(50% - 12px)",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Payment Status
                        </Typography>

                        <Box>
                          <Chip
                            size="small"
                            label={payment.payment_status || "Unknown"}
                            color={getStatusColor(payment.payment_status)}
                          />
                        </Box>
                      </Box>

                      <DetailField
                        label="Razorpay Order ID"
                        value={payment.razorpay_order_id}
                      />

                      <DetailField
                        label="Razorpay Payment ID"
                        value={payment.razorpay_payment_id}
                      />

                      <DetailField
                        label="Payment Date"
                        value={formatDate(payment.created_at)}
                      />
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No payment records found.
                </Typography>
              )}
            </>
          ) : (
            <Typography color="error">
              Unable to load registration details.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={handleCloseDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
