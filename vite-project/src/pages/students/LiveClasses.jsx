import React, { useState, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/students/Footer';
import { toast } from 'react-toastify';

const LiveClasses = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { enrolledCourses } = useContext(AppContext);

  const handleJoinMeeting = () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a meeting ID');
      return;
    }

    setIsJoining(true);
    
    // Construct Zoom meeting URL
    let zoomUrl = `https://zoom.us/j/${meetingId}`;
    if (password) {
      zoomUrl += `?pwd=${password}`;
    }
    
    // Open Zoom meeting in new tab
    window.open(zoomUrl, '_blank');
    
    setTimeout(() => {
      setIsJoining(false);
    }, 2000);
  };

  const handleCreateMeeting = () => {
    // Open Zoom web client for creating meetings
    window.open('https://zoom.us/meeting', '_blank');
  };

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src={assets.zoom_icon} alt="Live Classes" className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Live Classes</h1>
            <p className="text-gray-600 text-lg">
              Join live interactive sessions with your instructors and fellow students
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Join Meeting Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <img src={assets.zoom_icon} alt="Join" className="w-6 h-6" />
                Join Live Class
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting ID *
                  </label>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    placeholder="Enter meeting ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (if required)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter meeting password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleJoinMeeting}
                  disabled={isJoining}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Meeting'}
                </button>
              </div>
            </div>

            {/* Create Meeting Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <img src={assets.add_icon} alt="Create" className="w-6 h-6" />
                Create Live Class
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Start a new live class session for your enrolled students
                </p>
                
                <button
                  onClick={handleCreateMeeting}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Create New Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Use Live Classes</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">For Students:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Get the meeting ID from your instructor</li>
                  <li>Enter the meeting ID and password (if required)</li>
                  <li>Click "Join Meeting" to enter the live class</li>
                  <li>Make sure you have Zoom installed or use the web client</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">For Instructors:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Click "Create New Meeting" to start a session</li>
                  <li>Share the meeting ID with your students</li>
                  <li>Set a password for additional security if needed</li>
                  <li>Use screen sharing for presentations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          {enrolledCourses && enrolledCourses.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Enrolled Courses</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <img 
                      src={course.courseThumbnail || assets.course_1} 
                      alt={course.courseTitle}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                      onError={(e) => { e.target.src = assets.course_1; }}
                    />
                    <h4 className="font-semibold text-gray-800 mb-2">{course.courseTitle}</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Instructor: {course.educator?.name || 'Unknown'}
                    </p>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LiveClasses; 