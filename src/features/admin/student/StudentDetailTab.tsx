import { Box, Divider, Grid, IconButton, useTheme } from '@mui/material';
import CardComponent from '../../../components/card/Card';
import { getValue } from '../../../utils/localStorageUtil';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DownloadIcon from '@mui/icons-material/Download';
import { type JSX } from 'react';
import StudentIdCard from '../../student/profilecard/profilecard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BasicDetailsSkeleton from '../../../components/card/skeletonloader/BasicDetailsSkeleton';
import { useLoader } from '../../../context/LoaderContext';
import AddressSkeleton from '../../../components/card/skeletonloader/AddressSkeleton';
import Customtext from '../../../components/inputs/customtext/Customtext';
import HallTicket from '../master/syllabus/HallTicket';
type TabContent = {
  title: string;
  items: [string, any][];
  customRender?: () => JSX.Element;
};

type StudentDetailTabsProps = {
  student: any;
  activeTab: number;
  setActiveTab: (index: number) => void;
};

export default function StudentDetailTab({
  student,
  activeTab,
  setActiveTab,
}: StudentDetailTabsProps) {
  const theme = useTheme();
  const rollid = Number(getValue('rollid'));
  const { loading } = useLoader();
  // const [marksData, setMarksData] = useState<any>(null);


  const field = (label: string, value: any) => (
    <Box
      className="border-b border-gray-300 last:border-b-0"
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      py={0.5}
      gap={0.5}
    >
      <Customtext
        fieldName={label}
        sx={{
          width: { xs: '100%', sm: '50%' },
          color: theme.palette.custom.accent,
          wordBreak: 'break-word',
        }}
      />
      <Customtext
        fieldName={value || '-'}
        sx={{
          flex: 1,
          width: { xs: '100%', sm: 'auto' },
          color: theme.palette.text.secondary,
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
      />
    </Box>
  );

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'file';
    link.click();
  };

  const renderTabContent = (tab: TabContent) => {
    if (tab.customRender) return tab.customRender();

    if (tab.title === 'Documents') {
      const sampleDocs = tab.items.length
        ? tab.items
        : [
          { name: 'Aadhaar Card', fileUrl: '/sample-aadhaar.pdf' },
          { name: 'Passport', fileUrl: '/sample-passport.pdf' },
        ];

      return (
        <CardComponent>
          <Box className="py-2 px-3">
            <Customtext fieldName={tab.title} sx={{ mb: 0 }} />
          </Box>
          <Divider sx={{ borderColor: '#899000' }} />
          <CardComponent mb={3} p={2} sx={{ boxShadow: 'none', mb: 0, border: 'none' }}>
            <Box display="flex" flexDirection="column" gap={1}>
              {sampleDocs.length ? (
                sampleDocs.map((doc: any) => (
                  <Box
                    key={doc.name}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={1}
                    sx={{
                      borderBottom: '1px solid #e0e0e0',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Customtext
                      fieldName={doc.name}
                      sx={{
                        color: theme.palette.custom.accent
                      }}
                    />
                    <IconButton
                      onClick={() => handleDownload(doc.fileUrl)}
                      size="small"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <BasicDetailsSkeleton />
              )}
            </Box>
          </CardComponent>
        </CardComponent>
      );
    }

    return (
      <>
        {loading ? (
          <BasicDetailsSkeleton />
        ) : (
          <CardComponent>
            <Box className="py-2 px-3">
              <Customtext fieldName={tab.title} sx={{ mb: 0 }} />
            </Box>
            <Divider sx={{ borderColor: '#899000' }} />
            <CardComponent mb={3} p={2} sx={{ boxShadow: 'none', mb: 0, border: 'none' }}>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tab.items.length
                  ? tab.items.map(([label, value]) => <Box key={label}>{field(label, value)}</Box>)
                  : (
                    <Customtext
                      fieldName="No Data Available"
                    />
                  )}
              </Box>
            </CardComponent>
          </CardComponent>
        )
        }
      </>
    );
  };

  // Tabs
  // const admintabs = ['Basic Info', 'Academic', 'DEB', 'Documents', 'ID Card'];
  // const studenttabs = ['Basic Info', 'DEB', 'ID Card'];
  // const tabs = rollid === 2 ? studenttabs : admintabs;
  const formattedDate = new Date(student?.date_of_birth).toLocaleDateString("en-GB") // dd/mm/yyyy
  // Tab Contents
  const basicInfoTab: TabContent = {
    title: 'Basic Info',
    items: [
      ['Gender', student?.gender],
      ['Date of Birth', formattedDate],
      ['Blood Group', student?.blood_group],
      ['Whatsapp Number', student?.whatsapp_number],
      ['Marital Status', student?.marital_status],
      ['Religion', student?.religion],
      ['Aadhar Number', student?.aadhaar_number],
      ['Personal EmailId', student?.email],
      ['Nationality', student?.nationality],
    ],
    customRender: () => (
      <>
        {/* Basic Details */}
        {loading ? (
          <BasicDetailsSkeleton />
        ) : (
          <CardComponent>
            <Box className="py-2 px-3">
              <Customtext fieldName="Basic Details" sx={{ mb: 0 }} />
            </Box>
            <Divider sx={{ borderColor: '#899000' }} />

            <CardComponent mb={3} p={2} sx={{ boxShadow: 'none', mb: 0, border: 'none' }}>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ['Gender', student?.gender],
                  ['Date of Birth', formattedDate],
                  ['Blood Group', student?.blood_group],
                  ['Whatsapp Number', student?.whatsapp_number],
                  ['Marital Status', student?.marital_status],
                  ['Religion', student?.religion],
                  ['Aadhar Number', student?.aadhaar_number],
                  ['Personal EmailId', student?.email],
                  ['Nationality', student?.nationality],
                ].map(([label, value]) => (
                  <Box key={label}>{field(label, value)}</Box>
                ))}
              </Box>
            </CardComponent>
          </CardComponent>
        )}

        {/* Address */}
        {loading ? (
          <AddressSkeleton />
        ) : (
          <CardComponent>
            <Box className="py-2 px-3">
              <Customtext fieldName="Address" sx={{ mb: 0 }} />
            </Box>
            <Divider sx={{ borderColor: '#899000' }} />


            <CardComponent mb={3} p={2} sx={{ boxShadow: 'none', mb: 0, border: 'none' }}>
              {[
                {
                  title: 'Current Address',
                  value: `${student?.address_details?.corr_addr1}, ${student?.address_details?.corr_addr2}, ${student?.address_details?.corr_city} - ${student?.address_details?.corr_pin}`,
                  icon: <LocationOnIcon sx={{ color: '#105c8e', fontSize: 32 }} />,
                },
                {
                  title: 'Permanent Address',
                  value: `${student?.address_details?.perm_addr1}, ${student?.address_details?.perm_addr2}, ${student?.address_details?.perm_city} - ${student?.address_details?.perm_pin}`,
                  icon: <LocationOnIcon sx={{ color: '#BF2728', fontSize: 32 }} />,
                },
              ].map((card, index) => (
                <Grid container spacing={2} key={index}>
                  <Box
                    sx={{
                      backgroundColor: 'white',
                      p: 1,
                      width: '100%',
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.palette.background.default,
                          borderRadius: 3,
                          mr: 2,
                          mb: 1,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box>
                        <Customtext
                          fieldName={card.title}
                          sx={{
                            width: { xs: '100%', sm: '50%' },
                            color: theme.palette.custom.accent,
                            mb: 0,
                          }}
                        />
                        <Customtext
                          fieldName={card.value}
                          sx={{
                            color: theme.palette.text.primary
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </CardComponent>
          </CardComponent>
        )}
      </>
    ),
  };

  const academicTab: TabContent = {
    title: 'Academic Details',
    items: [
      ['SSC School', student?.academic_details?.ssc_school],
      ['SSC Scheme', student?.academic_details?.ssc_scheme],
      ['SSC Score', student?.academic_details?.ssc_score],
      ['SSC Year', student?.academic_details?.ssc_year],
      ['After SSC', student?.academic_details?.after_ssc],
      ['HSC School', student?.academic_details?.hsc_school],
      ['HSC Result', student?.academic_details?.hsc_result],
      ['HSC Scheme', student?.academic_details?.hsc_scheme],
      ['HSC Score', student?.academic_details?.hsc_score],
      ['HSC Year', student?.academic_details?.hsc_year],
    ],
  };

  const debTab: TabContent = {
    title: 'DEB Details',
    items: [
      ['DEB ID', student?.deb_details?.deb_id],
      // ['Name', student?.deb_details?.deb_name],
      // ['Gender', student?.deb_details?.deb_gender],
      // ['DOB', student?.deb_details?.deb_date_of_birth],
      ['ABC ID', student?.deb_details?.deb_abcid],
      // ['Status', student?.deb_details?.deb_status],
    ],
  };
  const cleanDocumentUrl = (value: string | null) => {
    if (!value) return null;

    return value
      .replace(/[{}"]/g, "")   // remove { } and "
      .split(",")[0]           // take first if array
      .trim();
  };


  const documentsTab: TabContent = {
    title: 'Documents',
    items: [],
    customRender: () => {
      if (loading) {
        return <BasicDetailsSkeleton />;
      }
      const theme = useTheme();
      const docs = [
        { label: 'Aadhar', value: cleanDocumentUrl(student?.document_details?.aadhar) },
        { label: 'Class 10th Marksheet', value: cleanDocumentUrl(student?.document_details?.class_10th_marksheet) },
        { label: 'Class 12th Marksheet', value: cleanDocumentUrl(student?.document_details?.class_12th_marksheet) },
        { label: 'Diploma Marksheet', value: cleanDocumentUrl(student?.document_details?.diploma_marksheet) },
        { label: 'Graduation Marksheet', value: cleanDocumentUrl(student?.document_details?.graduation_marksheet) },
        { label: 'Passport', value: cleanDocumentUrl(student?.document_details?.passport) },
        { label: 'Signature', value: cleanDocumentUrl(student?.document_details?.signature) },
        { label: 'Work Experience Certificates', value: cleanDocumentUrl(student?.document_details?.work_experience_certificates) },
      ];


      const availableDocs = docs.filter(doc => doc.value);

      return (
        <CardComponent>
          <Box className="py-2 px-3">
            <Customtext fieldName="Documents" sx={{ mb: 0 }} />
          </Box>
          <Divider sx={{ borderColor: '#899000' }} />
          <CardComponent mb={3} p={2} sx={{ boxShadow: 'none', border: 'none' }}>
            <Box display="flex" flexDirection="column" gap={1}>
              {availableDocs.map(doc => (
                <Box
                  key={doc.label}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: '4px',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PictureAsPdfIcon sx={{ color: theme.palette.grey[500], fontSize: '18px' }} />
                    </Box>
                    <Customtext
                      fieldName={doc.label}
                      sx={{ color: theme.palette.text.primary }}
                    />
                  </Box>
                  <IconButton
                    onClick={() => {
                      if (doc.value) {
                        window.open(doc.value, '_blank');
                      }
                    }}
                    sx={{
                      backgroundColor: 'black',
                      color: theme.palette.grey[300],
                      p: 0.6,
                      '&:hover': { backgroundColor: 'black' },
                    }}
                  >
                    <FileDownloadIcon sx={{ fontSize: '18px' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </CardComponent>
        </CardComponent>
      );
    },
  };

  const IDCardTab: TabContent = {
    title: "ID Card",
    items: [],

    customRender: () => (
      <CardComponent>
        <Box className="py-2 px-3">
          <Customtext fieldName="ID Card" sx={{ mb: 0 }} />
        </Box>
        <Divider sx={{ borderColor: "#899000" }} />

        {/* Outer Card Skeleton */}
        <StudentIdCard />
      </CardComponent>
    ),
  };

  const HallTicketTab: TabContent = {
    title: "Hall Ticket",
    items: [],
    customRender: () => (
      <CardComponent>
        <Box className="py-2 px-3">
          <Customtext fieldName="Hall Ticket" sx={{ mb: 0 }} />
        </Box>
        <Divider sx={{ borderColor: "#899000" }} />

        <Box>
          <HallTicket student={student} />
        </Box>
      </CardComponent>
    ),
  };

  const registrationNo = student?.registration_no;

  const getResultPdfPath = (registrationNo?: string) => {
    if (!registrationNo) return null;

    return `/assets/results/MS-${registrationNo}-1-MS-FEBRUARY-2026.jpg`;
  };

  const resultImage = getResultPdfPath(registrationNo);
  console.log(resultImage, "resultImage");

  const examResultsTab: TabContent = {
    title: "Exam Results",
    items: [],
    customRender: () => {
      if (loading) return <BasicDetailsSkeleton />;




      return (
        <CardComponent>
          {/* Header */}
          <Box className="py-2 px-3">
            <Customtext fieldName="Exam Results" sx={{ mb: 0 }} />
          </Box>

          <Divider sx={{ borderColor: "#899000" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3, // 👈 increase padding a bit
              backgroundColor: "#f5f5f5",
            }}
          >
            {resultImage ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "650px", // ID card style width
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                }}
              >
                <img
                  src={resultImage}
                  alt="Exam Result"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "contain", // 👈 ensures proper scaling
                  }}
                />

                {/* Download Button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    p: 1,
                  }}
                >
                  <IconButton
                    onClick={() => handleDownload(resultImage)}
                    sx={{
                      backgroundColor: "black",
                      color: "#fff",
                      p: 0.6,
                      "&:hover": { backgroundColor: "#333" },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Customtext fieldName="No Result Available" />
            )}
          </Box>
        </CardComponent>
      );
    },
  };

  // const examResultsTab: TabContent = {
  //   title: "Exam Results",
  //   items: [],
  //   customRender: () => {
  //     if (loading) return <BasicDetailsSkeleton />;

  //     const marks = marksData?.marks || [];

  //     // const total = marks.reduce(
  //     //   (sum: number, m: any) => sum + (m.final_marks || 0),
  //     //   0
  //     // );
  //     // const avg = marks.length ? (total / marks.length).toFixed(2) : 0;

  //     return (
  //       <CardComponent>
  //         {/* Header */}
  //         <Box className="py-2 px-3 flex justify-between items-center">
  //           <Customtext fieldName="Exam Results" sx={{ mb: 0 }} />
  //           {/* <Box className="text-sm text-gray-500">
  //           Total: <b>{total}</b> | Avg: <b>{avg}</b>
  //         </Box> */}
  //         </Box>

  //         <Divider sx={{ borderColor: "#899000" }} />

  //         <CardComponent p={2} sx={{ boxShadow: "none", border: "none", mx: 10, mt: 2 }}>

  //           {/* Table */}
  //           <TableContainer
  //             component={Paper}
  //             sx={{
  //               borderRadius: 3,
  //               overflow: "hidden",
  //               boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  //             }}
  //           >
  //             <Table>
  //               <TableHead>
  //                 <TableRow sx={{ backgroundColor: "#105c8e" }}>
  //                   <TableCell sx={{ color: "white", fontWeight: 600 }}>
  //                     S.No
  //                   </TableCell>
  //                   <TableCell sx={{ color: "white", fontWeight: 600 }}>
  //                     Course
  //                   </TableCell>
  //                   <TableCell sx={{ color: "white", fontWeight: 600 }}>
  //                     Marks
  //                   </TableCell>
  //                 </TableRow>
  //               </TableHead>

  //               <TableBody>
  //                 {marks.length > 0 ? (
  //                   marks.map((m: any, index: number) => (
  //                     <TableRow
  //                       key={m.id}
  //                       sx={{
  //                         "&:hover": {
  //                           backgroundColor: "#f5f5f5",
  //                         },
  //                       }}
  //                     >
  //                       <TableCell>{index + 1}</TableCell>
  //                       <TableCell>{m.course_name}</TableCell>
  //                       <TableCell>{m.final_marks}</TableCell>
  //                     </TableRow>
  //                   ))
  //                 ) : (
  //                   <TableRow>
  //                     <TableCell colSpan={3} align="center">
  //                       No Results Available
  //                     </TableCell>
  //                   </TableRow>
  //                 )}
  //               </TableBody>
  //             </Table>
  //           </TableContainer>

  //         </CardComponent>
  //       </CardComponent>
  //     );
  //   },
  // };



  const regPrefix = student?.registration_no?.substring(0, 3);
  const hideDebTab = regPrefix === "X02" || regPrefix === "X03";

  // ✅ PROGRAM + PAYMENT CONDITION

  const cutoffDate = new Date("2025-10-16");

  // Function to safely get payment date
  const getPaymentDate = (payments?: any[]) => {
    if (!Array.isArray(payments)) return null;

    // 1️⃣ Try semester fee first
    const semesterPayment = payments.find(
      (p) => p.payment_type === "semester_fee"
    );

    if (semesterPayment?.payment_date) {
      return new Date(semesterPayment.payment_date);
    }

    // 2️⃣ Fallback to application fee
    const applicationPayment = payments.find(
      (p) => p.payment_type === "application_fee"
    );

    if (applicationPayment?.payment_date) {
      return new Date(applicationPayment.payment_date);
    }

    return null;
  };

  // Get payment date
  const paymentDate = getPaymentDate(student?.payments);

  // Block only this student
  const isBlockedStudent =
    student?.registration_no === "O0525003";

  // Final eligibility rule
  const isEligibleForResults =
    student?.program_id === 1500038 &&
    paymentDate !== null &&
    paymentDate <= cutoffDate &&
    !isBlockedStudent;

  const batch = student?.batch
  const isJulyBatch = batch?.toLowerCase() === 'july';

  // const admintabs = [
  //   'Basic Info',
  //   'Academic',
  //   ...(hideDebTab ? [] : ['DEB']),
  //   'Documents',
  //   'ID Card',
  //   'Hall Ticket',
  //   ...(isEligibleForResults ? ['Exam Results'] : [])
  // ];

  const admintabs = [
    'Basic Info',
    'Academic',
    ...(hideDebTab ? [] : ['DEB']),
    'Documents',
    'ID Card',
    ...(isJulyBatch ? ['Hall Ticket'] : []),
    ...(isJulyBatch && isEligibleForResults
      ? ['Exam Results']
      : []),
  ];

  // const studenttabs = [
  //   'Basic Info',
  //   ...(hideDebTab ? [] : ['DEB']),
  //   'ID Card',
  //   'Hall Ticket',
  // ];

  const studenttabs = [
    'Basic Info',
    ...(hideDebTab ? [] : ['DEB']),
    'ID Card',
    ...(isJulyBatch ? ['Hall Ticket'] : []),
    // ...(isJulyBatch && isEligibleForResults
    //   ? ['Exam Results']
    //   : []),
  ];
  // const tabs = rollid === 2 ? studenttabs : admintabs;

  // const tabContents =
  //   rollid === 2
  //     ? [
  //       basicInfoTab,
  //       ...(hideDebTab ? [] : [debTab]),
  //       IDCardTab,
  //       HallTicketTab,
  //     ]
  //     : [
  //       basicInfoTab,
  //       academicTab,
  //       ...(hideDebTab ? [] : [debTab]),
  //       documentsTab,
  //       IDCardTab,
  //       HallTicketTab,
  //       ...(isEligibleForResults ? [examResultsTab] : [])
  //     ];

  /* -------------------- Role-based Tabs -------------------- */


  const tabs =
    rollid === 3
      ? ['Basic Info'] // ✅ ONLY this tab
      : rollid === 2
        ? studenttabs
        : admintabs;

  // const tabContents =
  //   rollid === 3
  //     ? [
  //         basicInfoTab, // ✅ ONLY this content
  //       ]
  //     : rollid === 2 && batch == 'July'
  //       ? [
  //           basicInfoTab,
  //           ...(hideDebTab ? [] : [debTab]),
  //           IDCardTab,
  //           HallTicketTab,
  //         ]
  //       : [
  //           basicInfoTab,
  //           academicTab,
  //           ...(hideDebTab ? [] : [debTab]),
  //           documentsTab,
  //           IDCardTab,
  //           HallTicketTab,
  //           ...(isEligibleForResults ? [examResultsTab] : []),
  //         ];

  const tabContents =
    rollid === 3
      ? [
        basicInfoTab,
      ]
      : rollid === 2
        ? [
          basicInfoTab,
          ...(hideDebTab ? [] : [debTab]),
          IDCardTab,
          ...(isJulyBatch ? [HallTicketTab] : []),
          ...(isJulyBatch && isEligibleForResults
            ? [examResultsTab]
            : []),
        ]
        : [
          basicInfoTab,
          academicTab,
          ...(hideDebTab ? [] : [debTab]),
          documentsTab,
          IDCardTab,
          ...(isJulyBatch ? [HallTicketTab] : []),
          ...(isJulyBatch && isEligibleForResults
            ? [examResultsTab]
            : []),
        ];
  // useEffect(() => {
  //   if (!isEligibleForResults) return;

  //   if (activeTab !== tabs.indexOf("Exam Results")) return;

  //   if (!student?.id) return;

  //   const fetchMarks = async () => {
  //     try {
  //       const res = await apiRequest({
  //         url: `${ApiRoutes.GETMARKSBYID}/${student.id}/marks`,
  //         method: "get",
  //       });

  //       setMarksData(res);

  //     } catch (err) {
  //       console.error("Error fetching marks", err);
  //     }
  //   };

  //   fetchMarks();

  // }, [activeTab, student, isEligibleForResults]);

  return (
    <>
      {/* Tab Headers */}
      <Box className="flex overflow-x-auto space-x-2 rounded mb-4 px-2">
        {tabs.map((tabLabel, index) => (
          <Box
            key={tabLabel}
            onClick={() => setActiveTab(index)}
            sx={{
              cursor: 'pointer',
              px: 2,
              py: 1,
              whiteSpace: 'nowrap',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.9rem',
              color: activeTab === index ? theme.palette.background.default : theme.palette.text.primary,
              backgroundColor: activeTab === index ? theme.palette.secondary.main : 'transparent',
              '&:hover': {
                backgroundColor:
                  activeTab === index
                    ? theme.palette.primary.main
                    : theme.palette.custom.highlight,
              },
            }}
          >
            {tabLabel}
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      {tabContents[activeTab] && renderTabContent(tabContents[activeTab])}
    </>
  );
}
