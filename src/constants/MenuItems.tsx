import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Payments as PaymentsIcon,
  Feedback as FeedbackIcon,
  MenuBook as MenuBookIcon,
  LibraryBooks as LibraryBooksIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  SupportAgent as SupportAgentIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  ReportProblem as ReportProblemIcon,
  Widgets as MasterIcon,
  Assessment as MarksIcon,
  AdminPanelSettings as RoleIcon
} from '@mui/icons-material';


import type { JSX } from 'react';

interface MenuItem {
  text: string;
  icon: string;
  routePath?: string;
  subItems: {
    text: string;
    routePath: string;
  }[];
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  // {
  //   text: 'Dashboard',
  //   icon: 'Dashboard',
  //   subItems: [],
  //   routePath: '/dashboard'
  // },
  {
    text: 'Students',
    icon: 'Students',
    subItems: [
      { text: 'Students List', routePath: '/students/list' },
      // { text: 'Fees List', routePath: '/students/feeslist' },
    ],
    routePath: '',
  },
  {
    text: 'Faculty',
    icon: 'Faculty',
    subItems: [
      { text: 'Faculty List', routePath: '/faculty' },
    ],
    routePath: '',
  },
  {
    text: 'Grievances',
    icon: 'Grievances',
    subItems: [
      // { text: 'Grievance', routePath: '/grievances' },
      // { text: 'Offline Grievance', routePath: '/grievances/offline' },
    ],
    routePath: '/grievances/admin/list',
  },
  {
    text: 'Master',
    icon: 'Master',
    subItems: [
      // { text: 'Syllabus List', routePath: '/syllabus' },
      { text: 'Roles', routePath: '/role-list' },
      { text: 'Departments', routePath: '/department-list' },
      { text: 'Programs', routePath: '/programs' },
      // { text: 'Schemes', routePath: '/schemes/list' },
      // { text: 'Semesters', routePath: '/semesters/list' },
      { text: 'Courses', routePath: '/courses/list' },
      // { text: 'Course Components', routePath: '/course-components/list' },
      { text: 'Exams', routePath: '/exam/list' },
      { text: 'Exam Timetable', routePath: '/exam-timetables/list' },
      // { text: 'Mark Entry', routePath: '/students-marks-entry' },
      { text: 'Payment Control', routePath: '/payment-control/list' },
      // { text: 'Batches', routePath: '/batch/list' },
      // { text: 'Years', routePath: '/year/list' },
    ],
    routePath: '',
  },
  // {
  //   text: 'Marks',
  //   icon: 'Marks',
  //   subItems: [
  //     { text: 'Mark Entry', routePath: '/marks-entry' },
  //   ],
  //   routePath: '',
  // },
];
export const STUDENT_MENU_ITEMS: MenuItem[] = [
  // {
  //   text: 'Dashboard',
  //   icon: 'Dashboard',
  //   subItems: [],
  //   routePath: '/dashboard/student'
  // },
  {
    text: 'Profile',
    icon: 'Profile',
    subItems: [
    ],
    routePath: '/students/detail'
  },
  {
    text: 'Fees',
    icon: 'Fees',
    subItems: [
      { text: 'Fees Detail', routePath: `/fees/detail` },
    ],
    routePath: '',
  },
  {
    text: 'Grievances',
    icon: 'Grievances',
    subItems: [
      // { text: 'Grievance', routePath: '/grievances' },
      // { text: 'Offline Grievance', routePath: '/grievances/offline' },
    ],
    routePath: '/grievances/list',
  },
  {
    text: 'Exam Results',
    icon: 'Examinations',
    subItems: [],
    routePath: '/exam-results',
  },
  // {
  //   text: 'Feedback & Survey',
  //   icon: 'Feedback',
  //   subItems: [],
  //   routePath: '/student/feedback',
  // },
  {
    text: 'Student Counselling',
    icon: 'Counselling',
    subItems: [],
    routePath: '/counselling',
  },
  // {
  //   text: 'Documents',
  //   icon: 'Documents',
  //   subItems: [],
  //   routePath: '/documents'
  // },
  // {
  //   text: 'Library',
  //   icon: 'Library',
  //   subItems: [],
  //   routePath: '/student/library',
  // },
  {
    text: 'Password Management',
    icon: 'Password',
    subItems: [],
    routePath: '/passwordmang',
  },
];
export const FACULTY_MENU_ITEMS: MenuItem[] = [
  {
    text: 'Profile',
    icon: 'Profile',
    subItems: [
    ],
    routePath: '/students/detail'
  },

  {
    text: 'Students',
    icon: 'Students',
    subItems: [
      // { text: 'Students List', routePath: '/students/list' },
      // { text: 'Fees List', routePath: '/students/feeslist' },
    ],
    routePath: '/students/list'
  },
  {
    text: 'Mentees',
    icon: 'Students',
    subItems: [
      // { text: 'Students List', routePath: '/students/list' },
      // { text: 'Fees List', routePath: '/students/feeslist' },
    ],
    routePath: '/students/list'
  },

  {
    text: 'Grievances',
    icon: 'Grievances',
    subItems: [
      // { text: 'Grievance', routePath: '/grievances' },
      // { text: 'Offline Grievance', routePath: '/grievances/offline' },
    ],
    routePath: '/facultylogin/grievance/list',
  },
  // {
  //   text: 'Marks',
  //   icon: 'Marks',
  //   subItems: [
  //     { text: 'Mark Entry', routePath: '/marks-entry' },
  //   ],
  //   routePath: '',
  // },

];

export const ICON_MAP: Record<string, JSX.Element> = {
  Dashboard: <DashboardIcon />,
  Students: <PeopleIcon />,
  Programs: <MenuBookIcon />,
  Faculty: <SchoolIcon />,
  Settings: <SettingsIcon />,
  Assignments: <AssignmentIcon />,
  Reports: <BarChartIcon />,

  // 🎓 Student Menu Icons
  Profile: <PersonIcon />,
  Fees: <PaymentsIcon />,
  Grievances: <ReportProblemIcon />,
  Examinations: <AssignmentIcon />,
  Feedback: <FeedbackIcon />,
  Counselling: <SupportAgentIcon />,
  Documents: <DescriptionIcon />,
  Library: <LibraryBooksIcon />,
  Password: <LockIcon />,
  Master: <MasterIcon />,
  Marks: <MarksIcon />,
  Role: <RoleIcon />
};
