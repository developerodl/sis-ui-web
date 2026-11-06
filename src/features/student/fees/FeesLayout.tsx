import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Tabs, Tab } from "@mui/material";
import PendingPaymentTab from "./PendingPaymentTab";
import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes } from "../../../constants/ApiConstants";
import { getValue } from "../../../utils/localStorageUtil";
import FeesDetail from "./Feesdetail";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function FeesLayout() {
  const student_id = getValue("student_id");

  const [tabValue, setTabValue] = useState(0);

  const [pendingPayment, setPendingPayment] =
    useState<any>(null);
  const [paymentNotice, setPaymentNotice] = useState("");

  const fetchPendingPayment = useCallback(async () => {
    if (!student_id) return null;
    try {
      const response = await apiRequest({
        url: `${ApiRoutes.GETPEDNINGPAYMENT}/${student_id}/pending-payment`,
        method: "get",
      });

      if (response?.workflow_enabled && Number(response?.pending_payment_amount) > 0) {
        setPendingPayment(response);
        setTabValue(1);
      } else {
        setPendingPayment(null);
        setTabValue(0);
      }
      return response;
    } catch (error) {
      console.error("Pending payment fetch failed", error);
      return null;
    }
  }, [student_id]);

  const refreshAfterPayment = useCallback(async () => {
    const response = await fetchPendingPayment();
    const status = String(response?.pending_payment_status || response?.payment_status || "").toLowerCase();
    if (["paid", "success", "successful", "captured", "completed"].includes(status)) {
      setPaymentNotice("Payment successful. Your latest payment status is confirmed.");
      setTabValue(0);
    } else if (status && status !== "pending") {
      setPaymentNotice(`Payment status: ${status}.`);
    } else {
      setPaymentNotice("We have not received confirmation yet. Refresh the page in a moment to check the latest status.");
    }
  }, [fetchPendingPayment]);

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabValue(newValue);
    console.log(event);

  };

  useEffect(() => {
    fetchPendingPayment();
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get("payment_status") || params.get("status");
    if (paymentResult) {
      setPaymentNotice(
        ["success", "paid", "captured"].includes(paymentResult.toLowerCase())
          ? "Payment completed. Your payment status has been refreshed."
          : "Payment was not completed. You can try again when ready."
      );
      fetchPendingPayment();
      params.delete("payment_status");
      params.delete("status");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
  }, [fetchPendingPayment]);



  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Fees Details" />
        {pendingPayment && (
          <Tab label="Payment Due" />
        )}
      </Tabs>

      {paymentNotice && <Alert severity={paymentNotice.startsWith("Payment completed") || paymentNotice.startsWith("Payment successful") ? "success" : "info"} sx={{ mb: 2 }}>{paymentNotice}</Alert>}

      {/* Fees Details Tab */}

      <TabPanel value={tabValue} index={0}>
        <FeesDetail />
      </TabPanel>

      {/* Pending Payment Tab */}

      {pendingPayment && student_id && (
        <TabPanel value={tabValue} index={1}>
          <PendingPaymentTab
            data={pendingPayment}
            studentId={student_id}
            onPaymentStatusRefresh={refreshAfterPayment}
          />
        </TabPanel>
      )}
    </Box>
  );
}
