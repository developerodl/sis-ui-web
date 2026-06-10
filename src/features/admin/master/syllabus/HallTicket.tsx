import React, { useRef, useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import DownloadIcon from "@mui/icons-material/Download";
import logo3 from "/assets/sidebar-logo.png";
import signature from "/assets/images/signature.jpg";
import maleimage from "/assets/images/male-logo.jpg";
import femaleimage from "/assets/images/female-logo.jpg";
import { getValue } from "../../../../utils/localStorageUtil";
import { BASE_URL } from "../../../../constants/ApiConstants";
const cellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "8px",
};
type HallTicketProps = {
  student?: any;
};


const HallTicket = ({ student }: HallTicketProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const gender = getValue("gender");
  const userimage = gender == "Female" ? femaleimage : maleimage;
  const student_id = student?.id || getValue("student_id");

  const profileImageUrl = student_id
    ? `${BASE_URL}student/profile-image-proxy/${student_id}`
    : null;
  const eveningSessionStudents = [
    "X0226023",
    "X0226036",
    "X0226018",
    "X0226017",
    "X0226030",
    "X0226006",
    "X0226034"
  ];

  const ihsMorningTimetable: string[][]= [
    [
      "1",
      "June 06 2026",
      "EHE25OCT01",
      "Occupational and Environmental Health",
      "10.00 AM - 12.00 PM",
    ],
    [
      "1",
      "June 07 2026",
      "EHE25OCT02",
      "Fundamentals of Physiology and Industrial Toxicology",
      "10.00 AM - 12.00 PM",
    ],
    [
      "1",
      "June 13 2026",
      "EHE25OCT03",
      "Occupational Exposure to Physical and Hazards",
      "10.00 AM - 12.00 PM",
    ],
    [
      "1",
      "June 14 2026",
      "EHE25OCT04",
      "Occupational Exposure to Particulates and Chemical Hazards",
      "10.00 AM - 12.00 PM",
    ],
    [
      "1",
      "June 20 2026",
      "EHE25OCT05",
      "Occupational Exposure to Biological and Ergonomic Hazards",
      "10.00 AM - 12.00 PM",
    ],
    [
      "1",
      "June 21 2026",
      "EHE25OCT06",
      "Research Methodology",
      "10.00 AM - 12.00 PM",
    ],
  ];

  const ihsEveningTimetable_for_ihs: string[][]= [
    [
      "1",
      "June 06 2026",
      "EHE25OCT01",
      "Occupational and Environmental Health",
      "6.30 PM - 8.30 PM",
    ],
    [
      "1",
      "June 07 2026",
      "EHE25OCT02",
      "Fundamentals of Physiology and Industrial Toxicology",
      "6.30 PM - 8.30 PM",
    ],
    [
      "1",
      "June 13 2026",
      "EHE25OCT03",
      "Occupational Exposure to Physical and Hazards",
      "6.30 PM - 8.30 PM",
    ],
    [
      "1",
      "June 14 2026",
      "EHE25OCT04",
      "Occupational Exposure to Particulates and Chemical Hazards",
      "6.30 PM - 8.30 PM",
    ],
    [
      "1",
      "June 20 2026",
      "EHE25OCT05",
      "Occupational Exposure to Biological and Ergonomic Hazards",
      "6.30 PM - 8.30 PM",
    ],
    [
      "1",
      "June 21 2026",
      "EHE25OCT06",
      "Research Methodology",
      "6.30 PM - 8.30 PM",
    ],
  ];

  // const is welness_coaaching

  const wellnessCoachingTimetable = [
  [
    "1",
    "June 06 2026",
    "MBL25OCT18",
    "Foundations of Wellness Coaching",
    "10.00 AM - 12.00 PM",
  ],
  [
    "1",
    "June 07 2026",
    "MBL25OCT19",
    "Diet and Holistic Wellness",
    "10.00 AM - 12.00 PM",
  ],
  [
    "1",
    "June 13 2026",
    "MBL25OCT20",
    "Physical Activity & Fitness",
    "10.00 AM - 12.00 PM",
  ],
  [
    "1",
    "June 14 2026",
    "MBL25OCT21",
    "Emotional Wellbeing, NLP & Stress Management",
    "10.00 AM - 12.00 PM",
  ],
  [
    "1",
    "June 20 2026",
    "MBL25OCT22",
    "Coaching Special Populations",
    "10.00 AM - 12.00 PM",
  ],
  [
    "1",
    "June 21 2026",
    "MBL25OCT23",
    "Research Methodology",
    "10.00 AM - 12.00 PM",
  ],
];
  // const isWellnessCoaching =
  //   String(student?.program_id) === "1500136";

  //   const isEveningStudent =
  //     eveningSessionStudents.includes(registrationNo);

  //   let examTimetable = [];

  //   if (isWellnessCoaching) {
  //     examTimetable = wellnessCoachingTimetable;
  //   }
  const registrationNo = student?.registration_no;

  const isIndustrialHygiene =
    String(student?.program_id) === "1500132";
  const isWellnessCoaching =
    String(student?.program_id) === "1500136";

  const isEveningStudent =
    eveningSessionStudents.includes(registrationNo);

  let examTimetable: string[][] = [];

  if (isIndustrialHygiene) {
    examTimetable = isEveningStudent
      ? ihsEveningTimetable_for_ihs
      : ihsMorningTimetable;
  } else if (isWellnessCoaching) {
    examTimetable = wellnessCoachingTimetable;
  }
  const toggleFlip = () => setIsFlipped((prev) => !prev);

  const handleDownloadPDF = async () => {
    if (!page1Ref.current || !page2Ref.current) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const capture = async (element: HTMLElement) => {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000
      });
      return canvas.toDataURL("image/jpeg",0.7);
    };

    // 🔥 Save states
    const originalFlip = isFlipped;
    const originalPage2Transform = page2Ref.current.style.transform;

    // 🔥 Force card to normal (no flip)
    setIsFlipped(false);

    // 🔥 Remove page2 rotate
    page2Ref.current.style.transform = "none";

    // Wait for DOM update
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Capture Page 1
    const img1 = await capture(page1Ref.current);
    pdf.addImage(img1, "PNG", 0, 0, 210, 297);

    // Capture Page 2
    pdf.addPage();
    const img2 = await capture(page2Ref.current);
    pdf.addImage(img2, "PNG", 0, 0, 210, 297);

    pdf.save("HallTicket.pdf");

    // 🔥 Restore everything
    page2Ref.current.style.transform = originalPage2Transform;
    setIsFlipped(originalFlip);
  };
  // const cleanDocumentUrl = (value: string | null) => {
  //   if (!value) return null;

  //   return value
  //     .replace(/[{}"]/g, "")   // remove { } and "
  //     .split(",")[0]           // take first if array
  //     .trim();
  // };
  const formattedDOB = student?.date_of_birth
    ? new Date(student.date_of_birth).toLocaleDateString("en-GB")
    : "-";
  const passwordDOB = formattedDOB !== "-"
    ? formattedDOB.replace(/\//g, "")
    : "-";

  const personalInfo = {
    name: `${student?.first_name} ${student?.last_name}`,
    gender: gender,
    dob: formattedDOB,
    registrationNo: student?.registration_no,
    program: student?.program_id == "1500038" ? (
      <Box component="span">B.Sc (Hons) - (Data Science)</Box>
    ) : student?.program_id == "1500132" ? (
      <Box component="span">
        PG certificate in Industrial Hygiene
      </Box>
    ) : student?.program_id == "1500136" ? (
      <Box component="span">
        PG certificate in Wellness Coaching
      </Box>
    ) : (
      "-"
    ),
    userImage: profileImageUrl,
    passwordDOB: passwordDOB
  };

  if (!isIndustrialHygiene && !isWellnessCoaching) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        // py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ perspective: "1500px" }}>
        <Box
          sx={{
            width: "210mm",
            minHeight: "297mm",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.8s",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ================= PAGE 1 ================= */}
          <Box
            ref={page1Ref}
            sx={{
              position: "absolute",
              width: "100%",
              minHeight: "297mm",
              backgroundColor: "#fff",
              padding: "12mm",
              backfaceVisibility: "hidden",
            }}
          >
            {/* HEADER */}
            <Box mb={6}>
              <Box display="flex" alignItems="center" gap={3} mb={2}>
                <img src={logo3} alt="logo" style={{ height: 80 }} />
                <Box
                  sx={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    color: "#0B1E77",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <Typography sx={{ fontSize: 25, fontWeight: 700, letterSpacing: 1 }}>
                    SRI RAMACHANDRA
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    INSTITUTE OF HIGHER EDUCATION AND RESEARCH
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    (Deemed to be University)
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    Porur, Chennai – 600 116
                  </Typography>
                  <Typography
                    align="center"
                    sx={{ fontSize: 15, fontWeight: 700, color: "#E10600", mt: 1, mb: 0.5 }}
                  >
                    CENTRE FOR DISTANCE AND ONLINE EDUCATION
                  </Typography>
                  <Typography align="center" sx={{ fontSize: 15, fontWeight: 600, color: "#090909ff" }}>
                    HALL TICKET – JUNE 2026
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  height: 1.2,
                  backgroundColor: "#000",
                  margin: "1px auto 0 auto",
                }}
              />
            </Box>

            {/* CANDIDATE + PHOTO */}
            <Box mt={5} display="flex" justifyContent="space-between">
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                rowGap={0}
                columnGap={0}
                width="100%"
              >
                {/* Column 1 */}
                <Typography>
                  <b>Candidate Name :</b>
                  <br />
                  {personalInfo.name}
                </Typography>

                {/* Column 2 (Move Right) */}
                <Typography sx={{ pl: 5 }}>
                  <b>Reg No :</b>
                  <br />
                  {personalInfo.registrationNo}
                </Typography>

                {/* Column 1 */}
                <Typography>
                  <b>Programme :</b>
                  <br />
                  {personalInfo.program}
                </Typography>

                {/* Column 2 (Move Right) */}
                <Typography sx={{ pl: 5 }}>
                  <b>Date of Birth :</b>
                  <br />
                  {personalInfo?.dob}
                </Typography>
              </Box>

              <Box sx={{ width: 150, height: 150, border: "1px solid #000" }}>
                <img
                  src={personalInfo.userImage ? personalInfo.userImage : userimage}
                  alt="Candidate"
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </Box>

            {/* EXAM TABLE */}
            <Box mt={5}>
              <table
                width="100%"
                style={{ borderCollapse: "collapse", fontSize: 14 }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ ...cellStyle, textAlign: "center" }}>Semester</th>
                    <th style={{ ...cellStyle, textAlign: "center" }}>Date</th>
                    <th style={{ ...cellStyle, textAlign: "center" }}>Course Code</th>
                    <th style={{ ...cellStyle, textAlign: "center" }}>Course</th>
                    <th style={{ ...cellStyle, textAlign: "center" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    examTimetable
                      .map((row, index) => (
                        <tr key={index}>
                          {row.map((cell, i) => (
                            <td key={i} style={cellStyle} align="center">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </Box>

            {/* NOTE */}
            <Box mt={5}>
              <Typography fontWeight={600}>Note :</Typography>
              <Typography mt={1}>
                1. Candidates must keep a printed copy of the Hall Ticket available throughout the examination.
              </Typography>
              <Typography mt={1}>
                2. Only candidates possessing a Hall Ticket and printed copy of the University Identity Card will be permitted to appear
                for the online examination. Identify verification may be conducted online.
              </Typography>
              <Typography mt={1}>
                3. Candidates shall read and strictly adhere to all instructions printed on the Hall Ticket.
              </Typography>
              <Typography mt={1}>
                4. Students must follow the prescribed dress code during the online examination.
              </Typography>
              <Typography mt={1}>
                5. Link to Access Exam Platform
                <br />
                https://exam.sriheronline.edu.in/login/index.php
                <br />
                UserName - {personalInfo.registrationNo}, Password - {personalInfo.passwordDOB}
              </Typography>
            </Box>

            {/* SIGNATURE */}
            <Grid container mt={10}>
              <Grid size={{ xs: 7 }} textAlign="left">
                <Typography fontWeight={700}>
                </Typography>
              </Grid>

              <Grid size={{ xs: 5 }} textAlign="center">
                <Typography fontWeight={700}>
                  <img
                    src={signature}
                    alt="Signature"
                    className="h-[45px] inline-block object-contain mb-1"
                  />
                </Typography>
              </Grid>
            </Grid>
            <Grid container mt={1}>
              <Grid size={{ xs: 7 }} textAlign="left">
                <Typography fontWeight={700}>
                  Specimen Signature of the Candidate
                </Typography>
              </Grid>

              <Grid size={{ xs: 5 }} textAlign="center">
                <Typography fontWeight={700}>
                  Director
                </Typography>
              </Grid>
            </Grid>

          </Box>

          {/* ================= PAGE 2 ================= */}
          <Box
            ref={page2Ref}
            sx={{
              position: "absolute",
              width: "100%",
              minHeight: "297mm",
              backgroundColor: "#fff",
              padding: "20mm",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <Typography textAlign="center" fontWeight={700} mb={4}>
              INSTRUCTIONS TO THE CANDIDATES
            </Typography>

            {[
              "Follow the official timetable strictly.",
              "Log in at least 15 minutes before the commencement of the exam.",
              "The examination will be conducted through the LMS Portal.",
              "Use your registered username and password only.",
              "Do not share your login credentials with anyone.",
              "Ensure a stable internet connection.",
              "Use a laptop with a functioning webcam is mandatory.",
              "Keep your device fully charged or connected to power source.",
              "Read all instructions carefully before attempting the questions.",
              "Submit answers within allotted time. Late submissions will not be entertained.",
              "Maintain honesty and integrity during the examination.",
              "Any form of malpractice, plagiarism, or unfair means will lead to disciplinary action as per university rules.",
              "In case of genuine technical issues, immediately inform the course instructor/exam cell with proper evidence(screenshots).",
              "Issues reported after the exam without valid proof will not be considered.",
              "Ensure that you receive a submission confirmation message after submitting the exam.",
              "Keep screenshot of the confirmation for your reference.",
            ].map((item, index) => (
              <Typography key={index} mb={1}>
                • {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      {/* BUTTONS */}
      <Box display="flex" gap={3} mb={2} mt={10}>
        <Button onClick={toggleFlip} variant="contained" color="secondary">
          <FlipCameraAndroidIcon />
        </Button>
        <Button onClick={handleDownloadPDF} variant="outlined" color="secondary">
          <DownloadIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default HallTicket;