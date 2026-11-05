
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { useLoader } from "../../../../context/LoaderContext";
import { useAlert } from "../../../../context/AlertContext";
import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import { exportToExcel } from "../../../../constants/excelExport";

import CardComponent from "../../../../components/card/Card";
import TableToolbar from "../../../../components/tabletoolbar/tableToolbar";
import TableSkeleton from "../../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../../components/card/errorUi/NoDataFoundUI";
import ReusableTable from "../../../../components/table/table";
import TablePagination from "../../../../components/tablepagination/tablepagination";
import CustomDialog from "../../../../context/ConfirmDialog";

export default function PaymentControlList() {
    const navigate = useNavigate();
    const { loading } = useLoader();
    const { showAlert } = useAlert();

    const [workflowList, setWorkflowList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete dialog states
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

    // Fetch workflow list
    useEffect(() => {
        fetchWorkflowList();
    }, []);

    const fetchWorkflowList = async () => {
        try {
            const response = await apiRequest({
                url: ApiRoutes.PAYMENTCONTROLLIST,
                method: "get",
            });

            setWorkflowList(
                Array.isArray(response)
                    ? response
                    : response?.data || []
            );
        } catch (error) {
            console.error("Failed to fetch workflow list", error);
            setWorkflowList([]);
        }
    };

    // Search filter
    const filteredData = workflowList.filter((row) => {
        const text = `
            ${row.program_id}
            ${row.batch}
            ${row.admission_year}
            ${row.semester}
            ${row.start_date || ""}
            ${row.end_date || ""}
            ${row.enabled}
        `.toLowerCase();

        return text.includes(searchText.toLowerCase());
    });

    // Export Excel
    const handleExportExcel = () => {
        exportToExcel(
            filteredData,
            [
                { header: "Program ID", key: "program_id" },
                { header: "Batch", key: "batch" },
                { header: "Admission Year", key: "admission_year" },
                { header: "Semester", key: "semester" },
                { header: "Start Date", key: "start_date" },
                { header: "End Date", key: "end_date" },
                { header: "Status", key: "enabled" },
            ],
            "Pending Payment Workflow",
            "Workflow"
        );
    };

    // Open delete confirmation
    const handleOpenDelete = (row: any) => {
        setSelectedWorkflow(row);
        setOpenDelete(true);
    };

    // Close delete confirmation
    const handleCloseDelete = () => {
        setSelectedWorkflow(null);
        setOpenDelete(false);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!selectedWorkflow?.id) return;

        try {
            await apiRequest({
                url: ApiRoutes.PAYMENTCONTROLDELETE(selectedWorkflow.id),
                method: "delete",
            });

            showAlert(
                "Payment workflow deleted successfully!",
                "success"
            );

            handleCloseDelete();
            await fetchWorkflowList();

            setPage((currentPage) =>
                Math.min(
                    currentPage,
                    Math.max(
                        0,
                        Math.ceil(
                            (filteredData.length - 1) / rowsPerPage
                        ) - 1
                    )
                )
            );
        } catch (err: any) {
            showAlert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to delete payment workflow.",
                "error"
            );
        }
    };

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
                <>
                    <TableToolbar
                        filters={[
                            {
                                key: "search",
                                label: "Search Program",
                                type: "text",
                                value: searchText,
                                onChange: (val) => {
                                    setSearchText(val);
                                    setPage(0);
                                },
                                placeholder: "Search all fields",
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
                            {
                                label: "Add",
                                color: "primary",
                                onClick: () => {
                                    navigate("/payment-control/add");
                                },
                            },
                        ]}
                    />

                    {loading ? (
                        <TableSkeleton />
                    ) : filteredData.length === 0 ? (
                        <NoDataFoundUI />
                    ) : (
                        <ReusableTable
                            columns={[
                                {
                                    key: "program_id",
                                    label: "Program ID",
                                },
                                {
                                    key: "batch",
                                    label: "Batch",
                                },
                                {
                                    key: "admission_year",
                                    label: "Admission Year",
                                },
                                {
                                    key: "semester",
                                    label: "Semester",
                                },
                                {
                                    key: "start_date",
                                    label: "Start Date",
                                },
                                {
                                    key: "end_date",
                                    label: "End Date",
                                },
                                {
                                    key: "enabled",
                                    label: "Status",
                                },
                            ]}
                            data={filteredData.map((row) => ({
                                ...row,
                                enabled: row.enabled
                                    ? "Enabled"
                                    : "Disabled",
                            }))}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            actions={[
                                {
                                    label: "Edit",
                                    icon: (
                                        <VisibilityIcon fontSize="small" />
                                    ),
                                    color: "secondary",
                                    onClick: (row) => {
                                        navigate(
                                            `/payment-control/edit/${row.id}`,
                                            {
                                                state: row,
                                            }
                                        );
                                    },
                                },
                                {
                                    label: "Delete",
                                    icon: (
                                        <DeleteIcon fontSize="small" />
                                    ),
                                    color: "error",
                                    onClick: handleOpenDelete,
                                },
                            ]}
                            actionDisplay="inline"
                        />
                    )}

                    <TablePagination
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={filteredData.length}
                        onPageChange={(newPage) => setPage(newPage)}
                        onRowsPerPageChange={(rows) => {
                            setRowsPerPage(rows);
                            setPage(0);
                        }}
                    />
                </>
            </CardComponent>

            {/* Delete Confirmation Dialog */}
            <CustomDialog
                open={openDelete}
                title="Delete Payment Workflow"
                description={
                    <>
                        Are you sure you want to delete this payment workflow
                        for{" "}
                        <strong>
                            {selectedWorkflow?.program_id}
                        </strong>
                        {" - "}
                        <strong>
                            {selectedWorkflow?.batch}
                        </strong>
                        {" - "}
                        <strong>
                            {selectedWorkflow?.admission_year}
                        </strong>
                        {" - "}
                        <strong>
                            {selectedWorkflow?.semester}
                        </strong>
                        ?
                    </>
                }
                confirmText="Delete"
                cancelText="Cancel"
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
