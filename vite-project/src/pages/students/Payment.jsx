import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/students/Navbar';
import Footer from '../../components/students/Footer';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, getToken, userData } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    location: '',
    selectedBank: null,
    paymentScreenshot: null
  });
  
  const [courseData, setCourseData] = useState(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [selectedBankInfo, setSelectedBankInfo] = useState(null);

  // Payment options
  const paymentOptions = {
    hbl: {
      name: 'HBL Bank',
      accountNumber: '1234-5678-9012-3456',
      accountTitle: 'Tech Learning Platform',
      icon: '🏦',
      type: 'bank'
    },
    ubl: {
      name: 'UBL Bank',
      accountNumber: '9876-5432-1098-7654',
      accountTitle: 'Tech Learning Platform',
      icon: '🏦',
      type: 'bank'
    },
    mcb: {
      name: 'MCB Bank',
      accountNumber: '5678-9012-3456-7890',
      accountTitle: 'Tech Learning Platform',
      icon: '🏦',
      type: 'bank'
    },
    jazz: {
      name: 'Jazz Cash',
      accountNumber: '0323 0407917',
      accountTitle: 'Tech Learning Platform',
      icon: '📱',
      type: 'mobile'
    },
    easypaisa: {
      name: 'Easy Paisa',
      accountNumber: '0317 7924417',
      accountTitle: 'Tech Learning Platform',
      icon: '📱',
      type: 'mobile'
    }
  };

  // Benefits of learning tech skills
  const techBenefits = [
    {
      icon: '💼',
      title: 'High-Demand Careers',
      description: 'Tech skills are in high demand globally with competitive salaries'
    },
    {
      icon: '🌍',
      title: 'Remote Work Opportunities',
      description: 'Work from anywhere with flexible schedules and global opportunities'
    },
    {
      icon: '🚀',
      title: 'Career Growth',
      description: 'Fast-track your career with continuous learning and skill development'
    },
    {
      icon: '💰',
      title: 'High Earning Potential',
      description: 'Tech professionals earn significantly higher than average salaries'
    },
    {
      icon: '🎯',
      title: 'Problem Solving Skills',
      description: 'Develop critical thinking and analytical problem-solving abilities'
    },
    {
      icon: '🔧',
      title: 'Practical Skills',
      description: 'Learn hands-on skills that you can apply immediately in real projects'
    }
  ];

  // Trust signals
  const trustSignals = [
    {
      icon: '✅',
      title: '100% Refundable',
      description: 'Not satisfied? Get your money back within 30 days, no questions asked'
    },
    {
      icon: '👥',
      title: '10,000+ Students',
      description: 'Join thousands of successful learners who transformed their careers'
    },
    {
      icon: '⭐',
      title: '4.8/5 Rating',
      description: 'Consistently high ratings from our satisfied students'
    },
    {
      icon: '🛡️',
      title: 'Secure Payment',
      description: 'Your payment information is encrypted and secure'
    },
    {
      icon: '📱',
      title: '24/7 Support',
      description: 'Get help anytime with our dedicated support team'
    },
    {
      icon: '🎓',
      title: 'Certified Courses',
      description: 'Industry-recognized certificates upon completion'
    }
  ];

  const handlePaymentSelect = (paymentKey) => {
    setFormData(prev => ({ ...prev, selectedBank: paymentKey }));
    setSelectedBankInfo(paymentOptions[paymentKey]);
    setShowAccountNumber(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Account number copied to clipboard!');
  };

  const handleWhatsAppClick = () => {
    const message = `Hi! I've made a payment for the course. Here are my details:
    
Course: ${courseData?.courseTitle || 'Tech Course'}
Email: ${formData.email}
Phone: ${formData.phoneNumber}
Location: ${formData.location}
Bank: ${selectedBankInfo?.name}
Amount: ${courseData?.coursePrice || 0}

Please verify my payment and provide course access.`;

    const whatsappUrl = `https://wa.me/+923230407917?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppClick2 = () => {
    const message = `Hi! I've made a payment for the course. Here are my details:
    
Course: ${courseData?.courseTitle || 'Tech Course'}
Email: ${formData.email}
Phone: ${formData.phoneNumber}
Location: ${formData.location}
Payment Method: ${selectedBankInfo?.name}
Amount: ${courseData?.coursePrice || 0}

Please verify my payment and provide course access.`;

    const whatsappUrl = `https://wa.me/+923177924417?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, paymentScreenshot: file }));
      toast.success('Screenshot uploaded successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.phoneNumber || !formData.location || !formData.selectedBank) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.paymentScreenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    try {
      const token = await getToken();
      const formDataToSend = new FormData();
      formDataToSend.append('courseId', id);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('selectedBank', formData.selectedBank);
      formDataToSend.append('paymentScreenshot', formData.paymentScreenshot);

      const { data } = await axios.post(
        `${backendUrl}/api/user/manual-payment`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success('Payment submitted successfully! We will verify and provide access soon.');
        navigate('/my-enrollment');
      } else {
        toast.error(data.message || 'Payment submission failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment submission failed');
    }
  };

  // Fetch course data on component mount
  React.useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
        if (data.success) {
          setCourseData(data.courseData);
        }
      } catch (error) {
        toast.error('Failed to fetch course data');
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id, backendUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            
            {/* Left Section - Benefits and Trust Signals */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Transform Your Career with Tech Skills</h1>
                <p className="text-blue-100 text-lg">
                  Join thousands of successful learners who have transformed their careers through our comprehensive tech courses.
                </p>
              </div>

              {/* Course Info */}
              {courseData && (
                <div className="bg-white/10 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-2">{courseData.courseTitle}</h2>
                  <p className="text-blue-100 mb-4">{courseData.courseDescription?.replace(/<p>ffff+<\/p>/g, '').substring(0, 150)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${courseData.coursePrice}</span>
                    {courseData.discount > 0 && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        {courseData.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Trust Signals */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Why Choose Us?</h3>
                <div className="space-y-3">
                  {trustSignals.map((signal, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-2xl">{signal.icon}</span>
                      <div>
                        <h4 className="font-semibold">{signal.title}</h4>
                        <p className="text-blue-100 text-sm">{signal.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Benefits */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Benefits of Learning Tech Skills</h3>
                <div className="grid grid-cols-1 gap-3">
                  {techBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-xl">{benefit.icon}</span>
                      <div>
                        <h4 className="font-semibold">{benefit.title}</h4>
                        <p className="text-blue-100 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section - Payment Form */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
                <p className="text-gray-600">Choose your preferred bank and provide payment details</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(paymentOptions).map(([key, payment]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePaymentSelect(key)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.selectedBank === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">{payment.icon}</div>
                        <div className="text-sm font-medium">{payment.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Number Display */}
                {showAccountNumber && selectedBankInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">{selectedBankInfo.type === 'bank' ? 'Bank' : 'Service'}:</span> {selectedBankInfo.name}</div>
                      <div className="flex items-center justify-between">
                        <span><span className="font-medium">{selectedBankInfo.type === 'bank' ? 'Account Number' : 'Number'}:</span> {selectedBankInfo.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(selectedBankInfo.accountNumber)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div><span className="font-medium">Account Title:</span> {selectedBankInfo.accountTitle}</div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Integration */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Verification</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    After making the payment, click the WhatsApp button below to share your payment screenshot for verification.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppClick}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>📱</span>
                      <span>Share via WhatsApp (0323 0407917)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppClick2}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>📱</span>
                      <span>Share via WhatsApp (0317 7924417)</span>
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a clear screenshot of your payment confirmation
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city/location"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Submit Payment Details
                </button>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h4>
                  <p className="text-yellow-700 text-sm">
                    Course access will only be provided after payment verification. Please ensure you share the payment screenshot via WhatsApp for faster processing.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment; 