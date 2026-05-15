<<<<<<< HEAD
// export const BASE_URL = 'https://api.sriramachandradigilearn.edu.in/';
// export const BASE_URL = 'https://uat-api.sriramachandradigilearn.edu.in/';
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
=======
export const BASE_URL = 'https://api.sriramachandradigilearn.edu.in/';
// export const BASE_URL = 'https://uat-api.sriramachandradigilearn.edu.in/';
import.meta.env.VITE_API_URL;
>>>>>>> aad56a61 (hallticket and id card fixed)
export const ApiRoutes = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  USERS: '/users',
  PRODUCTS: '/products',
  GETSTUDENTSLIST: '/student/list',
  GETSTUDENTBYID: 'student',
  STUDENTSYNC: 'student/sync',
  PUSHTODEBL: 'push/ugc',
  GETPROGRAMLIST: 'programe/list',
  PROGRAMADD: 'programe/add',
  PROGRAMFETCH: 'programe',
  PROGRAMUPDATE: 'programe/update',
  BULKADD: 'user/bulk-add',
  GETSTUDENTFEES: 'student/fees',
  CHANGEPASSWORD: 'user/change-password',

  GETFACULTYLIST: 'staff/list',
  FACULTYADD: 'staff/add',
  GETFACULTYBYID: 'staff',
  FACULTYUPDATE: 'staff/update',
  FACULTYDELETE: 'staff/delete',


  GETSYLLABUSLIST: 'syllabus/list',
  SYLLABUSADD: 'syllabus/add',
  COURSECODELIST: 'coursecode/list',
  COURSETITLELIST: 'coursetitle/list',
  COURSECODEADD: 'coursecode/add',
  COURSETITLEADD: 'coursetitle/add',
  GETROLES: 'admin/roles',
  ROLESADD: 'admin/roles/add',
  DELETEROLE: 'admin/delete',
  ROLESUPDATE: 'admin/update',
  GETDEPARTMENTS: 'department/list',
  DEPARTMENTADD: 'department/add',
  DEPARTMENTUPDATE: 'department/update',
  DEPARTMENTDELETE: 'department/delete',
  GETDEPARTMENTBYID: 'department',
  SCHEMES: 'schemes',
  SEMESTERS: 'semesters',
  COURSES: 'courses',
  COURSE_COMPONENTS: 'course-components',
  EXAMS: 'exams',
  EXAMTIMETABLES: 'exam-timetables',
  MARKSADD: 'student/student-marks/',
  GETMARKSBYID: 'student/students/',
  FORGOTPASSWORD: 'user/forgot-password',
  RESETPASSWORD: 'user/reset-password',
  GET_STUDENT_DUE: 'students/',
  GETPEDNINGPAYMENT: 'student',
  PAYMENTCONTROLLIST: 'programe/pending-payment-workflow/list',
  PAYMENTCONTROL: 'programe',

  /* Batch Master */

  /* Dropdown APIs */

  ACADEMICYEARLIST: 'academic-year/list',
  GETACADEMICYEARBYID: 'academic-year',
  ACADEMICUPDATE: 'academic-year/update',
  ACADEMICADD: 'academic-year/add',
  ACADEMICDELETE: 'academic-year/delete',


  BATCHLIST: 'batch/list',
  GETBATCHBYID: 'batch',
  BATCHUPDATE: 'batch/update',
  BATCHADD: 'batch/add',
  BATCHDELETE: 'batch/delete',


  GRIEVANCEADD: 'grievance/add',
  GRIEVANCELIST: 'grievance/list',
  GRIEVANCEBYID: 'grievance/grievance',
  GRIEVANCEDELETE: 'grievance/delete',
  GRIEVANCEUPDATE: 'grievance/update',
  GRIEVANCEREISSUE: 'grievance/reissue',


  GRIVANCELISTFORADMIN: 'grievance/admin/list',
  GRIVANCEVIEWBYIDADMIN: 'grievance/admin',
  GRIVANCEASSIGN: 'grievance/admin/assign',
  GRIEVANCEASSIGNADMIN: 'grievance/admin/assign',
  GRIEVANCECLOSEBYADMIN: 'grievance/admin/close',

  GRIEVANCEFACULTYLIST: 'grievance/faculty/list',
  GRIEVANCEFACULTYVIEW: 'grievance/faculty',
  GRIEVANCEUPDATEBYFACULTY: 'grievance/faculty/status',


  COURSECATEGORYLIST: 'course-categories',
  COURSECATEGORYADD: 'course-categories',
  COURSECATEGORYUPDATE:'course-categories',
  COURSECATEGORYDELETE: 'course-categories',
  COURSECATEGORYBYID: 'course-categories'


};
