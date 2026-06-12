// import DashboardStudent from "../features/dashboard/DashboardStudent";
import DashboardAdmin from "../features/admin/dashboard/DashboardAdmin";
import StudentList from "../features/admin/student/StudentList";
import StudentDetail from "../features/admin/student/StudentDetail";
import ProgramAdd from "../features/admin/programs/ProgramAdd";
import ProgramList from "../features/admin/programs/ProgramList";
import DashboardStudent from "../features/student/dashboard/DashboardStudent";
import FeesReceipt from "../features/student/fees/feesreceipt";
import GrievanceList from "../features/student/grievances/student/GrievanceList";
import Grievanceadd from "../features/student/grievances/student/grievanceadd";
import DocumemtsCard from "../features/student/documents/documents"
import StudentCounselling from "../features/student/counselling/counselling";
import ChangePasswordForm from "../features/student/passwordmang/ChangePasswordForm";
import FacultyList from "../features/admin/faculty/FacultyList";
import FacultyAdd from "../features/admin/faculty/FacultyAdd";
import SyllabusList from "../features/admin/master/syllabus/SyllabusList";
import SyllabusTabView from "../features/admin/master/syllabus/SyllabusTabView";
import MarksEntryScreen from "../features/admin/master/syllabus/MarksEntry";
import RoleList from "../features/admin/master/role/RoleList";
import DepartmentList from "../features/admin/master/department/Department";
import FeesList from "../features/admin/student/FeesList";
import SchemesList from "../features/admin/master/schemes/SchemesList";
import SchemesAdd from "../features/admin/master/schemes/SchemesAdd";
import SemestersList from "../features/admin/master/semester/SemesterList";
import SemestersAdd from "../features/admin/master/semester/SemestersAdd";
import CourseList from "../features/admin/master/course/CourseList";
import CourseAdd from "../features/admin/master/course/CourseAdd";
import CourseComponentsList from "../features/admin/master/coursecomponent/CourseComponentList";
import CourseComponentAdd from "../features/admin/master/coursecomponent/CourseComponentAdd";
import ExamList from "../features/admin/master/exam/ExamList";
import HallTicket from "../features/admin/master/syllabus/HallTicket";
import ExamAdd from "../features/admin/master/exam/ExamAdd";
import ExamTimeTableList from "../features/admin/master/examtimetable/ExamTimeTableList";
import ExamTimetableAdd from "../features/admin/master/examtimetable/ExamTimeTableAdd";
import StudentMarksEntry from "../features/admin/student/StudentsMarkScreen";
import ExamResults from "../features/admin/student/ExamResults";
import PaymentControlList from "../features/admin/master/payments/Payment-Contorl";
import PaymentWorkflowAdd from "../features/admin/master/payments/Payment-Contorl add";
import BatchList from "../features/admin/master/batch/BatchList";
import BatchAdd from "../features/admin/master/batch/BatchAdd";
import YearList from "../features/admin/master/year/YearList";
import YearAdd from "../features/admin/master/year/YearAdd";
import FeesLayout from "../features/student/fees/FeesLayout";
import GrievanceViewAdmin from "../features/student/grievances/admin/grievanceviewadmin";
import GrievanceAdminList from "../features/student/grievances/admin/Grievancelistadmin";
import GrievanceFacultyView from "../features/student/grievances/faculty/GrievanceFacultyView";
import GrievanceFacultyList from "../features/student/grievances/faculty/GrievanceFacultyList";

export const routesConfig = [
  {
    path: '/dashboard',
    children: [
      {
        path: '',
        element: <DashboardAdmin />, // default admin view
      },
      {
        path: 'student',
        element: <DashboardStudent />, // student view
      },
    ],
  },
  {
    path: '/students',
    // breadcrumb: 'Students List',
    children: [
      {
        path: 'list',
        element: <StudentList />,
        breadcrumb: 'Students List',
      },
      {
        path: 'detail',
        element: <StudentDetail />,
        breadcrumb: 'Student Detail',
      },
      {
        path: 'feeslist',
        element: <FeesList />,
        breadcrumb: 'Fees List',
      },
    ],
  },
  {
    path: '/faculty',
    breadcrumb: 'Faculty List',
    children: [
      {
        path: '',
        element: <FacultyList />,
        breadcrumb: 'Faculty List',
      },
      {
        path: 'add',
        element: <FacultyAdd />,
        breadcrumb: 'Faculty Add',
      },
      {
        path: 'add/:id',   // ✅ edit program route
        element: <FacultyAdd />,
        breadcrumb: 'Faculty Edit',
      },
    ],
  },
  {
    path: '/syllabus',
    breadcrumb: 'Syllabus List',
    children: [
      {
        path: '',
        element: <SyllabusList />,
        breadcrumb: 'Syllabus List',
      },
      {
        path: 'add',
        // element: <SyllabusAd />,
        breadcrumb: 'Syllabus Add',
      },
      {
        path: 'add/:id',   // ✅ edit program route
        // element: <SyllabusAdd />,
        breadcrumb: 'Syllabus Add',
      },
      {
        path: 'view/:id',   // ✅ edit program route
        element: <SyllabusTabView />,
        breadcrumb: 'Syllabus Edit',
      },
    ],
  },
  {
    path: '/programs',
    breadcrumb: 'Programs List',
    children: [
      {
        path: '',
        element: <ProgramList />,
        breadcrumb: 'Programs List',
      },
      {
        path: 'add',
        element: <ProgramAdd />,
        breadcrumb: 'Programs Add',
      },
      {
        path: 'add/:id',   // ✅ edit program route
        element: <ProgramAdd />,
        breadcrumb: 'Programs Edit',
      },
    ],
  },
  {
    path: '/fees',
    // breadcrumb: 'Fees',
    children: [
      {
        path: 'detail',
        element: <FeesLayout />,
        breadcrumb: 'Fees Detail',
      },
      {
        path: 'receipt/:id',
        element: <FeesReceipt />,
        breadcrumb: 'Fees Receipt',
      }
    ]
  },
  {
    path: '/grievances',
    breadcrumb: 'Grievances',
    children: [
      {
        path: 'list',
        element: <GrievanceList />,
        breadcrumb: 'Grievances List',
      },
      {
        path: 'add',
        element: <Grievanceadd />,
        breadcrumb: 'Grievance Add',
      },
      {
        path: 'edit/:id',
        element: <Grievanceadd />,
        breadcrumb: 'Grievance Edit',
      }
    ]
  },
  {
    path: '/grievances',
    breadcrumb: 'Grievances',
    children: [
      {
        path: 'admin/list',
        element: <GrievanceAdminList />,
        breadcrumb: 'Grievances List',
      },
      {
        path: 'admin/view/:id',
        element: <GrievanceViewAdmin />,
        breadcrumb: 'Grievances View',
      },
    ]
  },
  {
    path: '/exam-results',
    element: <ExamResults />,
    breadcrumb: 'Exam Results',
  },
  {
    path: '/documents',
    element: <DocumemtsCard />,
    breadcrumb: 'Documents',
  },
  {
    path: '/counselling',
    element: <StudentCounselling />,
    breadcrumb: 'Student Counselling',
  },
  {
    path: '/passwordmang',
    element: <ChangePasswordForm />,
    breadcrumb: 'Password Managment',
  },
  {
    path: '/marks-entry',
    element: <MarksEntryScreen />,
    breadcrumb: 'Marks Entry',
  },
  {
    path: '/hall-ticket',
    element: <HallTicket />,
    breadcrumb: 'Hall Ticket',
  },
  {
    path: '/role-list',
    element: <RoleList />,
    breadcrumb: 'Role List',
  },
  {
    path: '/department-list',
    element: <DepartmentList />,
    breadcrumb: 'Department List',
  },
  {
    path: '/schemes',
    // breadcrumb: 'Fees',
    children: [
      {
        path: 'list',
        element: <SchemesList />,
        breadcrumb: 'Schemes List',
      },
      {
        path: 'add',
        element: <SchemesAdd />,
        breadcrumb: 'Scheme Add',
      },
      {
        path: 'edit/:id',   // ✅ edit program route
        element: <SchemesAdd />,
        breadcrumb: 'Scheme Edit',
      },
    ]
  },
  {
    path: '/semesters',
    children: [
      {
        path: 'list',
        element: <SemestersList />,
        breadcrumb: 'Semesters List',
      },
      {
        path: 'add',
        element: <SemestersAdd />,
        breadcrumb: 'Semester Add',
      },
      {
        path: 'edit/:id',   // ✅ edit program route
        element: <SemestersAdd />,
        breadcrumb: 'Semester Edit',
      },
    ]
  },
  {
    path: '/courses',
    children: [
      {
        path: 'list',
        element: <CourseList />,
        breadcrumb: 'Courses List',
      },
      {
        path: 'add',
        element: <CourseAdd />,
        breadcrumb: 'Courses Add',
      },
      {
        path: 'edit/:id',
        element: <CourseAdd />,
        breadcrumb: 'Courses Edit',
      },
    ]
  },
  {
    path: '/course-components',
    children: [
      {
        path: 'list',
        element: <CourseComponentsList />,
        breadcrumb: 'Course Components List',
      },
      {
        path: 'add',
        element: <CourseComponentAdd />,
        breadcrumb: 'Course Components Add',
      },
      {
        path: 'edit/:id',
        element: <CourseComponentAdd />,
        breadcrumb: 'Course Components Edit',
      },
    ]
  },
  {
    path: '/exam',
    children: [
      {
        path: 'list',
        element: <ExamList />,
        breadcrumb: 'Exams List',
      },
      {
        path: 'add',
        element: <ExamAdd />,
        breadcrumb: 'Exam Add',
      },
      {
        path: 'edit/:id',
        element: <ExamAdd />,
        breadcrumb: 'Exams Edit',
      },
    ]
  },
  {
    path: '/exam-timetables',
    children: [
      {
        path: 'list',
        element: <ExamTimeTableList />,
        breadcrumb: 'Exam Timetables List',
      },
      {
        path: 'add',
        element: <ExamTimetableAdd />,
        breadcrumb: 'Exam Timetable Add',
      },
      {
        path: 'edit/:id',
        element: <ExamTimetableAdd />,
        breadcrumb: 'Exam Timetable Edit',
      },
    ]
  },
  {
    path: '/students-marks-entry',
    element: <StudentMarksEntry />,
    breadcrumb: 'Marks Entry',
  },
  {
    path: '/payment-control',
    children: [
      {
        path: 'list',
        element: <PaymentControlList />,
        breadcrumb: 'Payment Control List',
      },
      {
        path: 'add',
        element: <PaymentWorkflowAdd />,
        breadcrumb: 'Pending Payment Add',
      },
      {
        path: 'edit/:id',
        element: <PaymentWorkflowAdd />,
        breadcrumb: 'Pending Payment Edit',
      },
    ],
  },
  {
    path: '/batch',
    children: [
      {
        path: 'list',
        element: <BatchList />,
        breadcrumb: 'Batch List',
      },
      {
        path: 'add',
        element: <BatchAdd />,
        breadcrumb: 'Batch Add',
      },
      {
        path: 'edit/:id',
        element: <BatchAdd />,
        breadcrumb: 'Batch Edit',
      },
    ],
  },
  {
    path: '/year',
    children: [
      {
        path: 'list',
        element: <YearList />,
        breadcrumb: 'Year List',
      },
      {
        path: 'add',
        element: <YearAdd />,
        breadcrumb: 'Year Add',
      },
      {
        path: 'edit/:id',
        element: <YearAdd />,
        breadcrumb: 'Year Edit',
      },

    ],
  },
  {
    path:'facultylogin',
    children: [
       {
        path: 'grievance/list',
        element: <GrievanceFacultyList />,
        breadcrumb: 'Grievance List',
      },
      {
        path: 'grievance/view/:id',
        element: <GrievanceFacultyView />,
        breadcrumb: 'Grievance View',
      },
    ]
  }
];
