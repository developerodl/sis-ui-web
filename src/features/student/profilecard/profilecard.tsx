import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import clsx from "clsx";
import logo3 from "/assets/logo3.png";
import maleimage from "/assets/images/male-logo.jpg";
import femaleimage from "/assets/images/female-logo.jpg";
import signature from "/assets/images/signature.jpg";
import { getValue } from "../../../utils/localStorageUtil";
import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes, BASE_URL } from "../../../constants/ApiConstants";
import Barcode from "react-barcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import DownloadIcon from "@mui/icons-material/Download";
import IDCardSkeleton from "../../../components/card/skeletonloader/IDCardSkeleton";

const StudentHorizontalIDCard = () => {

  const getProxyImageUrl = (url: string | null) => {
    if (!url) return null;

    return `${BASE_URL}student/profile-image-proxy/${student_id}`;
  };
  const [isFlipped, setIsFlipped] = useState(false);
  const student_id = getValue("student_id");
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleFlip = () => setIsFlipped((prev) => !prev);
  const gender = getValue("gender");
  const userimage = gender == "Female" ? femaleimage : maleimage;
  // const userimage = 'https://d1jgwwhd2xazx1.cloudfront.net/uploads/student/document/6719/21235/2025/09/16/68c93391d0bdf518716830_PHOTO.jpg?Expires=1762406006&Signature=oS64gV0VFWIhRgFVS2YrSkqpNorE9t8LGO8xsKS~5AcSdsjd971shggcnxuIK53R5wsYxrevrVGunfFHI9xoo0DaDAfxSAbGRkfLpY5cvUFLC~w5rtxdteRueuR1WRHkO5NYF-bpvwMRDZrBrPmIr964UygDXiu9dWAZXYYVlLCibtU4a-yFtL6knE73Q68xc5uwOxS41st4K9qL6uvOx-uGu4FWJA-5y-zCWsYDJJKSDMiADyixTXeuOtOjWp3X1LFwSVjlWPmygNZF~OXnxdET1hiFKkB1caEywM5o0vKXj-3kHhwdG6fuKB4k9x5Y-ddOYzyBFq1cs01djPGrYg__&Key-Pair-Id=K3KU6FKMGSED79'

  const [student, setStudent] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLocalLoading(true);
        const response = await apiRequest({
          url: `${ApiRoutes.GETSTUDENTBYID}/${student_id}`,
          method: "get",
        });
        setStudent(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLocalLoading(false);
      }
    };

    if (student_id) fetchStudent();
  }, [student_id]);

  if (localLoading) {
    return <IDCardSkeleton />;
  }


  const formatDate = (dateString: any) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  /**
   * Download PDF:
   * - Capture front & back separately by cloning them, removing 3D transform
   * - Ensure images are loaded
   * - Create a PDF with two A4 landscape pages and place each card centered
   */
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    const front = cardRef.current.querySelector(".front-side") as HTMLElement | null;
    const back = cardRef.current.querySelector(".back-side") as HTMLElement | null;
    if (!front || !back) {
      console.error("Front or back element not found");
      return;
    }

    const cardWidth = 324;
    const cardHeight = 216;
    const pageWidth = 595;
    const pageHeight = 842;
    const scaleFactor = (pageWidth * 0.85) / cardWidth;
    const scaledWidth = cardWidth * scaleFactor;

    const createClone = (el: HTMLElement) => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.webkitTransform = "none";
      clone.style.width = `${cardWidth}px`;
      clone.style.height = `${cardHeight}px`;
      clone.style.boxSizing = "border-box";
      clone.style.position = "relative";
      clone.style.left = "0";
      clone.style.top = "0";

      const isBackSide = el.classList.contains("back-side");

      // ✅ Remove all Tailwind right paddings (pr-0 to pr-10)
      clone.querySelectorAll("[class*='pr-']").forEach((node: any) => {
        const element = node as HTMLElement;
        element.style.paddingRight = "0px";
      });

      // 🧩 FRONT SIDE ADJUSTMENTS
      if (!isBackSide) {
        // 1️⃣ Header height
        const header = clone.querySelector(".front-side > div:first-child") as HTMLElement;
        if (header) header.style.height = "60px";

        // 2️⃣ Student image (max 95px)
        const userImg = clone.querySelector("img[alt='Student']") as HTMLImageElement;
        if (userImg) {
          userImg.style.maxHeight = "80px";
          userImg.style.width = "auto";
          userImg.style.objectFit = "contain";
          userImg.style.border = "1px solid #ccc";
          userImg.style.borderRadius = "6px";
        }

        // 3️⃣ Details box
        const detailsBox = clone.querySelector(".pdf-details") as HTMLElement;
        if (detailsBox) {
          const padding = 10;
          const remainingWidth = cardWidth - 100 - padding * 2;
          detailsBox.style.width = `${remainingWidth}px`;
          detailsBox.style.height = "auto";

          detailsBox.querySelectorAll("*").forEach((node: any) => {
            node.style.fontSize = "10px";
            node.style.lineHeight = "12px";
          });

          const grid = detailsBox.querySelector(".grid") as HTMLElement;
          if (grid) grid.style.gridTemplateColumns = "65px 10px auto";
        }

        // 4️⃣ Signature section
        const sigBox = clone.querySelector(".pdf-details > div:last-child") as HTMLElement;
        if (sigBox) {
          const sigImg = sigBox.querySelector("img") as HTMLImageElement;
          if (sigImg) {
            sigImg.style.width = "60px";
            sigImg.style.height = "20px";
            sigImg.style.objectFit = "contain";
            sigImg.style.marginTop = "10px";
          }
          const caption = sigBox.querySelector(".MuiTypography-root") as HTMLElement;
          if (caption) {
            caption.style.fontSize = "6px";
            caption.style.lineHeight = "6px";
          }
        }

        // 5️⃣ Logo & heading
        const logoImg = clone.querySelector("img[alt='Sri Ramachandra Logo']") as HTMLImageElement;
        if (logoImg) {
          logoImg.style.width = "260px";
          logoImg.style.height = "20px";
          logoImg.style.objectFit = "contain";
        }

        const heading = clone.querySelector("h6, .MuiTypography-subtitle2") as HTMLElement;
        if (heading) {
          heading.style.fontSize = "10px";
          heading.style.letterSpacing = "0.3px";
          heading.style.marginTop = "5px";
        }
      }

      // 🧩 BACK SIDE smaller font
      if (isBackSide) {
        clone.querySelectorAll("*").forEach((node: any) => {
          node.style.fontSize = "10px";
          node.style.lineHeight = "10px";
        });
      }

      return clone;
    };

    // 🕓 Wait for all images to load
    const waitImagesLoaded = (root: HTMLElement) =>
      Promise.all(
        Array.from(root.querySelectorAll("img")).map(
          (img) =>
            new Promise<void>((resolve) => {
              if ((img as HTMLImageElement).complete) return resolve();
              (img as HTMLImageElement).onload = () => resolve();
              (img as HTMLImageElement).onerror = () => resolve();
            })
        )
      );

    try {
      const frontClone = createClone(front);
      const backClone = createClone(back);

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = `${pageWidth}px`;
      wrapper.style.height = `${pageHeight}px`;
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.justifyContent = "center";
      wrapper.style.alignItems = "center";
      wrapper.style.background = "#ffffff";
      wrapper.style.gap = "40px";

      wrapper.appendChild(frontClone);
      wrapper.appendChild(backClone);
      document.body.appendChild(wrapper);

      await waitImagesLoaded(wrapper);
      await new Promise((r) => setTimeout(r, 150));

      const canvas = await html2canvas(wrapper, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scale: 3,
        imageTimeout: 15000,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pageWidth, pageHeight],
      });

      const imgWidth = scaledWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`${student?.registration_no || "Student_ID"}.pdf`);

      document.body.removeChild(wrapper);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const cleanDocumentUrl = (value: string | null) => {
    if (!value) return null;

    return value
      .replace(/[{}"]/g, "")   // remove { } and "
      .split(",")[0]           // take first if array
      .trim();
  };

  const getBatchYearFromRegNo = (regNo?: string) => {
    if (!regNo) return null;

    const prefix = regNo.substring(0, 3); // X02, X03

    if (prefix === "X02" || prefix === "X03") {
      return {
        batch: "January",
        year: "2026",
      };
    }

    return null;
  };



  const regBatchYear = getBatchYearFromRegNo(student?.registration_no);

  const personalInfo = {
    fullName: `${student?.first_name || ""} ${student?.last_name || ""}`,
    email: student?.email,
    phoneNumber: student?.mobile_number,

    program:
      student?.program_id == "1500038" ? (
        <Box component="span">B.Sc (Hons) - (Data Science)</Box>
      ) : student?.program_id == "1500132" ? (
        <Box component="span">
          PG certificate in Industrial Hygiene
        </Box>
      ) : student?.program_id == "1500136" ? (
        <Box component="span">
          PG certificate in Wellness Coaching
        </Box>
      ) :
        student?.program_id == "1500130" ? (
          <Box component="span">
            Pg Certificate in Organisational Behaviour Analysis
          </Box>
        ) :
          (
            "-"
          ),

    department: student?.department || "CDOE",

    // ✅ HERE IS THE KEY PART
    batch: regBatchYear?.batch || student?.batch || "July",
    year: regBatchYear?.year || student?.year || "2025",

    registration_no: student?.registration_no,
    parent_guardian_name: student?.parent_guardian_name,
    address: `${student?.address_details?.corr_addr1 || ""}, ${student?.address_details?.corr_city || ""} - ${student?.address_details?.corr_pin || ""}`,
    // userImage: cleanDocumentUrl(student?.document_details?.profile_image),
    userImage: getProxyImageUrl(cleanDocumentUrl(student?.document_details?.profile_image)),
    relationship_with_student: student?.relationship_with_student,
  };


  return (
    <Box
      className="flex flex-col items-center justify-center bg-gray-100 py-10"
      sx={{ perspective: "1000px" }}
    >
      {/* Flip container */}
      <Box
        ref={cardRef}
        className={clsx(
          "relative w-[520px] h-[320px] transition-transform duration-700",
          { "[transform:rotateY(180deg)]": isFlipped }
        )}
        sx={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT SIDE */}
        <Box
          className="absolute w-full h-full bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden front-side"
          sx={{
            backfaceVisibility: "hidden",
          }}
        >
          {/* Header */}
          <Box
            className="h-[100px] bg-[#08446B] flex flex-col items-center justify-center border-b border-gray-300"
          >

            <img
              src={logo3}
              alt="Sri Ramachandra Logo"
              className="object-contain"
              style={{
                height: "70px",
                width: "355px", // expanded within safe limit of 520px
                maxWidth: "100%",
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "white",
                fontSize: "0.9rem",
                letterSpacing: "1px",
                marginTop: "2px",
                marginBottom: "3px",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Centre for Distance and Online Education (CDOE)
            </Typography>
          </Box>


          {/* Body */}
          <Box className="flex px-2 py-3 gap-3">
            {/* Photo */}
            <Box>
              <img
                // src={personalInfo.userImage ? personalInfo.userImage : userimage}
                // alt="Student"
                // crossOrigin="anonymous"
                // className="w-[130px] h-[140px] rounded-md border border-gray-300 object-cover"
                src={personalInfo.userImage || userimage}
                alt="Student"
                crossOrigin="anonymous"
                className="w-[130px] h-[140px] rounded-md border border-gray-300 object-cover"
              />
            </Box>

            {/* Details */}
            <Box
              className="w-[75%] text-sm leading-6 space-y-1 pdf-details">
              <Box className="grid grid-cols-[120px_20px_1fr] gap-y-1 mb-2">
                {[
                  { label: "ID No", value: student?.registration_no || "—" },
                  {
                    label: "Name",
                    value: `${student?.first_name || ""} ${student?.last_name || ""}`,
                  },
                  { label: "Course", value: personalInfo?.program || "—" },
                  {
                    label: "Yr. of Admn",
                    value: `${personalInfo.batch} - ${personalInfo.year}` || "—",
                  },
                ].map((item, index) => (
                  <React.Fragment key={index}>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>:</Typography>
                    <Typography
                      sx={{
                        fontWeight: 600, fontSize: '14px',
                        color: item.label === "ID No" ? "#BF2728" : "inherit",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>

              {/* Signature + Issuing Authority */}
              <Box textAlign="right" className="pr-3">
                <img
                  src={signature}
                  alt="Signature"
                  className="h-[45px] inline-block object-contain mb-1"
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    fontStyle: "italic",
                    fontSize: "0.8rem",
                  }}
                >
                  Issuing Authority
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>

        {/* BACK SIDE */}
        <Box
          className="absolute w-full h-full bg-white rounded-xl shadow-xl border border-gray-300 p-4 text-sm back-side
          pdf-details"
          sx={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          {/* <Typography sx={{ fontWeight: 600, fontSize: '14px' }} mt={1}>
            {personalInfo.relationship_with_student}'s Name 
            : {personalInfo.parent_guardian_name || "—"}
          </Typography> */}
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }} className="mt-1">
            Res. Address :
            <br />
            {personalInfo.address || "—"}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }} className="mt-2">
            Contact Number : {personalInfo.phoneNumber || "—"}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
            Date of Birth : {formatDate(student?.date_of_birth)}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
            Blood Group : {student?.blood_group || "—"}
          </Typography>

          {/* Barcode */}
          <Box className="mt-1 flex flex-col items-center justify-center">
            <Barcode
              value={student?.registration_no || "A0322002"}
              width={1.5}
              height={50}
              displayValue={true}
              fontSize={12}
              background="#ffffff"
              lineColor="#000000"
            />
          </Box>
        </Box>
      </Box>

      {/* Buttons */}
      {/* Icon Buttons */}
      <Box display="flex" gap={2} mt={4}>
        <Button
          onClick={toggleFlip}
          variant="contained"
          sx={{
            minWidth: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "#1b3b6f",
            "&:hover": { backgroundColor: "#0e2a4b" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FlipCameraAndroidIcon sx={{ fontSize: 28, color: "#fff" }} />
        </Button>

        <Button
          onClick={handleDownloadPDF}
          variant="outlined"
          sx={{
            minWidth: 56,
            height: 56,
            borderRadius: "50%",
            borderColor: "#1b3b6f",
            color: "#1b3b6f",
            "&:hover": { backgroundColor: "#1b3b6f", color: "#fff" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DownloadIcon sx={{ fontSize: 28 }} />
        </Button>
      </Box>
    </Box>
  );
};

export default StudentHorizontalIDCard;