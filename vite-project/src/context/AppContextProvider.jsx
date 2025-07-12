import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth,useUser} from '@clerk/clerk-react'
import axios from 'axios'
import {toast} from "react-toastify"

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);  
  const [userData, setUserData] = useState(null);    
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const {getToken} = useAuth()
  const {user} = useUser()

  // Fetch all courses
  const fetchAllCourses = async () => {
     try {
      const {data}= await axios.get(backendUrl + '/api/course/all' )

      if (data.success) {
        setAllCourses(data.course)
      }else{
       toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  //fetch UserData
  const fetchUserData = async () => {
    try {
        const token = await getToken()

        const {data} = await axios.get(backendUrl +'/api/user/data',{headers:{
          Authorization:`Bearer ${token}`
        }})
        if (data.success) {
          setUserData(data.user)
        }else{
          toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
   }

  // Function to calculate average rating of a course
  const CalculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let totalrating = 0;
    course.courseRatings.forEach((rating) => {
      totalrating += rating.rating;
    });
    return Math.floor(totalrating / course.courseRatings.length)
  };

  // Function to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map(
      (lecture) => (time += lecture.lectureDuration)
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to calculate total course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map(
        (lecture) => (time += lecture.lectureDuration)
      )
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to calculate number of lectures in course
  const calculateNoOfLectures = (course) => {
    let totallectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totallectures += chapter.chapterContent.length;
      }
    });
    return totallectures;
  };

  //fetch user enrolledCourses
  const fetchUserEnrolledCourses = async () => {
    try {
        const token = await getToken();
      const {data} = await axios.get(backendUrl+'/api/user/enrolled-courses',
        {headers:{Authorization:`Bearer ${token}`}})

        if (data.success) {
           setEnrolledCourses(data.enrolledCourses.reverse())
        }else{
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user && user.publicMetadata && user.publicMetadata.role === 'educator') {
      setIsEducator(true)
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchUserEnrolledCourses()
    }
  }, [user])
  
  const value = {
    currency,
    allCourses,
    navigate,
    CalculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses, 
    setEnrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};
