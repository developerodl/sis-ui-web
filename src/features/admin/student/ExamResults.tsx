import { Box, IconButton } from "@mui/material";
import CardComponent from "../../../components/card/Card";
import Customtext from "../../../components/inputs/customtext/Customtext";
import DownloadIcon from "@mui/icons-material/Download";
import { getValue } from "../../../utils/localStorageUtil";

export default function ExamResults() {
    const role = String(getValue("role_name") || "").trim().toLowerCase();
    const registrationNo = getValue("username"); // ✅ keep string

    if (role !== "student") return null;

    const getResultPdfPath = (registrationNo?: string) => {
        if (!registrationNo) return null;
        return `/assets/results/MS-${registrationNo}-1-MS-FEBRUARY-2026.jpg`;
    };

    const resultImage = getResultPdfPath(String(registrationNo));

    const handleDownload = (url: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = url.split("/").pop() || "result";
        link.click();
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh", // 👈 vertical center
                backgroundColor: "#f5f5f5",
                p: 2,
            }}
        >
           <CardComponent
  sx={{
    width: "100%",
    maxWidth: "850px", // ✅ bigger
    borderRadius: 2,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  }}
>

                {resultImage ? (
                    <>
                        <img
                            src={resultImage}
                            alt="Exam Result"
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                            }}
                        />

                        {/* Download */}
                        <Box display="flex" justifyContent="flex-end" p={1}>
                            <IconButton
                                onClick={() => handleDownload(resultImage)}
                                sx={{
                                    backgroundColor: "black",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#333" },
                                }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box p={2}>
                        <Customtext fieldName="No Result Available" />
                    </Box>
                )}
            </CardComponent>
        </Box>
    );
}
