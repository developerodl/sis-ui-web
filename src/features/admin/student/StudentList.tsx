import * as React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../utils/ApiRequest';
import { ApiRoutes } from '../../../constants/ApiConstants';
import CardComponent from '../../../components/card/Card';
import ReusableTable from '../../../components/table/table';
import SyncIcon from '@mui/icons-material/Sync';
import TableToolbar from '../../../components/tabletoolbar/tableToolbar';
import TablePagination from '../../../components/tablepagination/tablepagination';
import { exportToExcel } from '../../../constants/excelExport';
import { CloudUploadIcon } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import UploadExcelDialog from '../../../components/alertcard/Excelcard';
import * as XLSX from "xlsx";
import { getValue, setValue } from '../../../utils/localStorageUtil';
import TableSkeleton from '../../../components/card/skeletonloader/Tableskeleton';
import { useLoader } from '../../../context/LoaderContext';
import { NoDataFoundUI } from '../../../components/card/errorUi/NoDataFoundUI';
import { useGlobalError } from '../../../context/ErrorContext';
import apiClient from '../../../services/ApiClient';
import { useLocation } from 'react-router-dom';

export default function StudentTable() {

  const [students, setStudents] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchText, setSearchText] = React.useState('');
  const [programFilter, setProgramFilter] = React.useState('');

  const [programs, setPrograms] = React.useState<any[]>([]);
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);

  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { loading } = useLoader();
  const { clearError } = useGlobalError();

  const rollid = Number(getValue('rollid'));
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const urlname = searchParams.get("urlname");


  /* -------------------- Fetch Program List -------------------- */

  React.useEffect(() => {
    clearError();

    apiClient
      .get(ApiRoutes.GETPROGRAMLIST)
      .then((res) => {
        setPrograms(res.data || []);
      })
      .catch(() => setPrograms([]));

  }, []);

  /* -------------------- Default Program for Role 3 -------------------- */

  React.useEffect(() => {

    if (rollid == 3 && programs.length > 0) {
      setProgramFilter("1500038");
      setPage(0);
    }

  }, [rollid, programs]);

  /* -------------------- Convert Programs to Select Options -------------------- */

  const programOptions = React.useMemo(
    () =>
      programs.map((p) => ({
        label: p.programe,
        value: p.id,
      })),
    [programs]
  );

  /* -------------------- Fetch Students -------------------- */

  const fetchStudents = async () => {
    try {

      const data = await apiRequest({
        url: ApiRoutes.GETSTUDENTSLIST,
        method: 'get'
      });

      setStudents(Array.isArray(data) ? data : data.data);

    } catch (error) {
      setStudents([]);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, []);

  /* -------------------- View Student -------------------- */

  const handleView = (id: any) => {
    setValue('student_id', id);
    navigate('/students/detail');
  };

  /* -------------------- Date Formatter -------------------- */

  const formatDate = (dateStr: any) => {

    const date = new Date(dateStr);

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  };

  /* -------------------- Admission Date Logic -------------------- */

  const getSemesterPaymentDate = (payments?: any[]) => {

    if (!Array.isArray(payments)) return "-";

    const semesterPayment = payments.find(
      (p) => p.payment_type === "semester_fee"
    );

    if (semesterPayment?.payment_date) {
      return formatDate(semesterPayment.payment_date);
    }

    const applicationPayment = payments.find(
      (p) => p.payment_type === "application_fee"
    );

    if (applicationPayment?.payment_date) {
      return formatDate(applicationPayment.payment_date);
    }

    return "-";
  };

  /* -------------------- Filters -------------------- */

  // const filteredStudents = students.filter((s) => {

  //   const fullName =
  //     `${s.title} ${s.first_name} ${s.last_name}`.toLowerCase();

  //   const combinedText = `
  //     ${s.registration_no}
  //     ${fullName}
  //     ${s.program_id}
  //     ${s.mobile_number}
  //     ${s.gender}
  //     ${s.payments?.[0]?.payment_date}
  //   `.toLowerCase();

  //   return (

  //     combinedText.includes(searchText.toLowerCase()) &&

  //     (programFilter === '' ||
  //       String(s.program_id) == String(programFilter))

  //   );

  // });

  const filteredStudents = React.useMemo(() => {

    const filtered = students.filter((s) => {

      const fullName =
        `${s.title} ${s.first_name} ${s.last_name}`.toLowerCase();

      const combinedText = `
      ${s.registration_no}
      ${fullName}
      ${s.program_id}
      ${s.mobile_number}
      ${s.gender}
      ${s.payments?.[0]?.payment_date}
    `.toLowerCase();

      return (

        combinedText.includes(searchText.toLowerCase()) &&

        (programFilter === '' ||
          String(s.program_id) == String(programFilter))

      );

    });

    // ✅ Special condition for Mentis
    if (urlname === "Mentees") {
      return filtered.slice(0, 6);
    }

    return filtered;

  }, [students, searchText, programFilter, urlname]);

  /* -------------------- Export Excel -------------------- */

  const handleExportExcel = () => {

    exportToExcel(
      filteredStudents,
      [
        { header: 'S.No', key: 'sno' },

        { header: 'Student ID', key: 'id' },

        { header: 'Registration No', key: 'registration_no' },

        {
          header: 'Full Name',
          key: 'full_name',
          render: (s) =>
            `${s.title} ${s.first_name} ${s.last_name}`,
        },

        { header: 'Program ID', key: 'program_id' },

        { header: 'Mobile', key: 'mobile_number' },

        { header: 'Gender', key: 'gender' },

        {
          header: 'Admission Date',
          key: 'admission_date',
          render: (s) =>
            getSemesterPaymentDate(s.payments),
        },
      ],
      'Students',
      'Students'
    );
  };

  /* -------------------- Sync -------------------- */

  const handleSync = async () => {

    try {

      await apiRequest({
        url: ApiRoutes.STUDENTSYNC,
        method: 'post'
      });

      await fetchStudents();

      setPage(0);

      showAlert(
        "Sync completed successfully!",
        "success"
      );

    } catch (error: any) {

      showAlert(
        error.response?.data?.message ||
        "Sync failed. Try again.",
        "error"
      );
    }
  };

  /* -------------------- Excel Upload -------------------- */

  const handleExcelUpload = async (file: File) => {

    try {

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array"
      });

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const rows: any[] =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      if (!rows.length)
        throw new Error(
          "Excel file is empty"
        );

      const group_id =
        rows[0].group_id || 0;

      const users =
        rows.map(row => ({

          username: row.username,

          first_name: row.first_name,

          last_name: row.last_name,

          program_id: row.program_id,

          phone: row.phone,

          student_id: row.student_id,

          email: row.email

        }));

      await apiRequest({

        url: ApiRoutes.BULKADD,

        method: "post",

        data: {
          group_id,
          users
        }

      });

      showAlert(
        "Excel uploaded successfully!",
        "success"
      );

    } catch (error) {

      console.error(error);

      showAlert(
        "Failed to upload Excel.",
        "error"
      );
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <>

      <CardComponent
        sx={{
          width: '100%',
          maxWidth: {
            xs: '350px',
            sm: '900px',
            md: '1300px'
          },
          mx: 'auto',
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
              onChange: setSearchText,
              placeholder:
                "Search all fields",
              visible: true,
            },

            {
              key: "program",
              label: "Select Course",
              type: "select",
              value: programFilter,
              onChange: (val) => {
                setProgramFilter(val);
                setPage(0);
              },
              options: programOptions,

              disabled:
                rollid === 3,

              sx: {
                width: 250,
              },

              menuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 250,
                    overflowY: "auto",
                  },
                },
              },

            }

          ]}

          actions={[

            {
              label: 'Bulk Upload',
              color: 'secondary',
              variant: 'outlined',
              startIcon:
                <CloudUploadIcon />,
              onClick: () =>
                setOpenUploadDialog(true),
            },

            {
              label: 'Sync',
              color: 'primary',
              variant: 'outlined',
              startIcon:
                <SyncIcon />,
              onClick: handleSync,
            },

            {
              label: 'Export Excel',
              color: 'secondary',
              startIcon:
                <FileDownloadIcon />,
              onClick: handleExportExcel,
            },

          ]}

        />

        {
          loading ? (
            <TableSkeleton />
          ) : (
            filteredStudents.length === 0
              ? <NoDataFoundUI />
              : (
                <ReusableTable

                  columns={[

                    {
                      key:
                        "registration_no",
                      label:
                        "Registration No"
                    },

                    {
                      key:
                        "full_name",
                      label:
                        "Full Name",
                      render:
                        (r) =>
                          `${r.title} ${r.first_name} ${r.last_name}`,
                    },

                    {
                      key:
                        "program_id",
                      label:
                        "Program ID"
                    },

                    {
                      key:
                        "mobile_number",
                      label:
                        "Mobile"
                    },

                    {
                      key:
                        "gender",
                      label:
                        "Gender"
                    },

                    {
                      key:
                        "admission_date",
                      label:
                        "Admission Date",
                      render:
                        (r) =>
                          getSemesterPaymentDate(
                            r.payments
                          ),
                    }

                  ]}

                  data={
                    filteredStudents
                  }

                  page={page}

                  rowsPerPage={
                    rowsPerPage
                  }

                  actions={[

                    {
                      label:
                        "View",

                      icon:
                        <VisibilityIcon fontSize="small" />,

                      onClick:
                        (row) =>
                          handleView(row.id),

                      color:
                        'secondary',
                    }

                  ]}

                />
              )
          )
        }

        <TablePagination

          page={page}

          rowsPerPage={
            rowsPerPage
          }

          totalCount={
            filteredStudents.length
          }

          onPageChange={
            setPage
          }

          onRowsPerPageChange={
            (newRows) => {

              setRowsPerPage(
                newRows
              );

              setPage(0);

            }
          }

        />

      </CardComponent>

      <UploadExcelDialog

        open={
          openUploadDialog
        }

        onClose={
          () =>
            setOpenUploadDialog(
              false
            )
        }

        onUpload={
          handleExcelUpload
        }

      />

    </>
  );
}