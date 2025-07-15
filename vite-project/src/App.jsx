import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';

import CourseList from './pages/students/CoursesList';
import CourseDetails from './pages/students/CourseDetails';
import Home from './pages/students/Home';
import MyEnrollments from './pages/students/MyEnrollments';
import Loading from './components/students/Loading';
import { ToastContainer } from 'react-toastify';
import Educator from './pages/educator/Educator';
import AddCourse from './pages/educator/AddCourse';
import EditCourse from './pages/educator/EditCourse';
import MyCourses from './pages/educator/MyCourses';
import StudentsEnrolled from './pages/educator/StudentsEnrolled';
import Dashboard from './pages/educator/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import Navbar from './components/students/Navbar';
import "quill/dist/quill.snow.css";

const App = () => {
  const isEducatorRoute = useMatch('/educator/*');
  const isAdminRoute = useMatch('/admin/*');

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer/>
      {!isEducatorRoute && !isAdminRoute && <Navbar />}

      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollment" element={<MyEnrollments />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Educator Routes */}
        <Route path="/educator" element={<Educator />}>
          <Route index element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="edit-course/:courseId" element={<EditCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
};

export default App;
