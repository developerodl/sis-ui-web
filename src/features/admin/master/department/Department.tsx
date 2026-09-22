import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

import { useGlobalError } from "../../../../context/ErrorContext";
import { useLoader } from "../../../../context/LoaderContext";
import { apiRequest } from "../../../../utils/ApiRequest";
import { ApiRoutes } from "../../../../constants/ApiConstants";
import CardComponent from "../../../../components/card/Card";
import TableToolbar from "../../../../components/tabletoolbar/tableToolbar";
import TableSkeleton from "../../../../components/card/skeletonloader/Tableskeleton";
import { NoDataFoundUI } from "../../../../components/card/errorUi/NoDataFoundUI";
import ReusableTable from "../../../../components/table/table";
import TablePagination from "../../../../components/tablepagination/tablepagination";
import { exportToExcel } from "../../../../constants/excelExport";
import { useAlert } from "../../../../context/AlertContext";
import CustomDialog from "../../../../context/ConfirmDialog";

export default function DepartmentList() {
    const { clearError } = useGlobalError();
    const { loading } = useLoader();

    const [department, setDepartment] = React.useState<any[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage] = React.useState(10);
    const [searchText, setSearchText] = React.useState("");

    const [openAddDepartment, setOpenAddDepartment] = React.useState(false);
    const [departmentName, setDepartmentName] = React.useState("");
    const [departmentCode, setDepartmentCode] = React.useState("");
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editingDepartmentId, setEditingDepartmentId] = React.useState<number | null>(null);

    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedDepartment, setSelectedDepartment] = React.useState<any>(null);
    const { showAlert } = useAlert();

    React.useEffect(() => {
        clearError();
        fetchDepartments();
    }, []);

    const fetchDepartments = () => {
        apiRequest({ url: ApiRoutes.GETDEPARTMENTS, method: "get" as const })
            .then((data) => setDepartment(Array.isArray(data) ? data : data.data))
            .catch(() => setDepartment([]));
    };

    const formattedData = department.map((r, index) => ({
        ...r,
        sno: index + 1,
        name: r.name || "",
        search_text: `${r.id} ${r.name}`.toLowerCase(),
    }));

    const filteredRoles = formattedData.filter((r) =>
        r.search_text.includes(searchText.toLowerCase())
    );

    const handleExportExcel = () => {
        exportToExcel(
            filteredRoles,
            [
                { header: "S.No", key: "sno" },
                { header: "Department Code", key: "department_code" },
                { header: "Department Name", key: "name" },
            ],
            "Department",
            "Department_List"
        );
    };

    const handleSaveDepartment = async () => {
        if (!departmentName.trim()) {
            showAlert("Department name is required.", "error");
            return;
        }
        if (!isEditMode && !departmentCode.trim()) {
            showAlert("Department code is required.", "error");
            return;
        }

        const apiConfig = isEditMode
            ? {
                url: `${ApiRoutes.DEPARTMENTUPDATE}/${editingDepartmentId}`,
                method: "put" as const,
                data: { name: departmentName },
            }
            : {
                url: ApiRoutes.DEPARTMENTADD,
                method: "post" as const,
                data: {
                    name: departmentName.trim(),
                    department_code: departmentCode.trim(),
                },
            };

        try {
            await apiRequest(apiConfig);

            showAlert(
                isEditMode
                    ? "Department updated successfully!"
                    : "Department added successfully!",
                "success"
            );

            handleCloseDepartmentDialog();
            fetchDepartments();
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Something went wrong. Please try again.";

            showAlert(errorMessage, "error");
        }
            };


    const handleEditDepartment = (row: any) => {
        setIsEditMode(true);
        setEditingDepartmentId(row.id);
        setDepartmentName(row.name);
        setDepartmentCode(row.department_code || "");
        setOpenAddDepartment(true);
    };

    const handleOpenDelete = (row: any) => {
        setSelectedDepartment(row);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setSelectedDepartment(null);
        setOpenDelete(false);
    };
    const handleConfirmDelete = async () => {
        if (!selectedDepartment?.id) return;

        try {
            await apiRequest({
                url: `${ApiRoutes.DEPARTMENTDELETE}/${selectedDepartment.id}`,
                method: "delete" as const,
            });

            showAlert("Department deleted successfully!", "success");

            handleCloseDelete();
            fetchDepartments();
        } catch (err: any) {
            showAlert(
                err.response?.data?.message ||
                "Failed to delete department.",
                "error"
            );
        }
    };



    const handleCloseDepartmentDialog = () => {
        setOpenAddDepartment(false);
        setDepartmentName("");
        setDepartmentCode("");
        setIsEditMode(false);
        setEditingDepartmentId(null);
    };

    return (
        <>
            <CardComponent
                sx={{
                    width: "100%",
                    maxWidth: { xs: "350px", sm: "900px", md: "900px" },
                    mx: "auto",
                    p: 3,
                    mt: 3,
                }}
            >
                <TableToolbar
                    filters={[
                        {
                            key: "search",
                            label: "Search",
                            type: "text",
                            value: searchText,
                            onChange: (val) => setSearchText(val),
                            placeholder: "Search by department name...",
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
                            label: "Add Department",
                            color: "primary",
                            onClick: () => setOpenAddDepartment(true),
                        },
                    ]}
                />

                {loading ? (
                    <TableSkeleton />
                ) : filteredRoles.length === 0 ? (
                    <NoDataFoundUI />
                ) : (
                    <ReusableTable
                        columns={[
                            { key: "department_code", label: "Department Code", width: 150 },
                            { key: "name", label: "Department Name", width: 180 },
                        ]}
                        data={filteredRoles}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        actions={[
                            {
                                label: "Edit",
                                icon: <EditIcon fontSize="small" />,
                                onClick: handleEditDepartment,
                                color: "primary",
                            },
                            {
                                label: "Delete",
                                icon: <DeleteIcon fontSize="small" />,
                                onClick: handleOpenDelete,
                                color: "error",
                            },
                        ]}
                        actionDisplay="inline"
                    />
                )}

                <TablePagination
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={filteredRoles.length}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </CardComponent>

            <Dialog open={openAddDepartment} onClose={handleCloseDepartmentDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? "Edit Department" : "Add Department"}</DialogTitle>
                <DialogContent dividers>

                    <TextField
                        fullWidth
                        label="Department Code"
                        value={departmentCode}
                        onChange={(e) => setDepartmentCode(e.target.value.toUpperCase())}
                        disabled={isEditMode}
                        autoFocus={!isEditMode}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Department Name"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDepartmentDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveDepartment} disabled={!departmentName.trim() || (!isEditMode && !departmentCode.trim())}>
                        {isEditMode ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
            <CustomDialog
                open={openDelete}
                title="Delete Department"
                description={
                    <>
                        Are you sure you want to delete{" "}
                        <strong>
                            {selectedDepartment?.name}
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
