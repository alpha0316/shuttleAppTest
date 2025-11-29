import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';


function Auth() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  type FormKeys = keyof typeof formData;
  const [errors, setErrors] = useState<Partial<Record<FormKeys, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FormKeys, boolean>>>({});

  const BASE_URL = 'https://shuttle-backend-0.onrender.com';
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return '';

      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return '';

      case 'phone':
        if (!value) {
          return 'Phone number is required';
        }
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          return 'Phone number must be exactly 10 digits';
        }
        if (!/^0\d{9}$/.test(cleanPhone)) {
          return 'Phone number must start with 0 (e.g., 0551234567)';
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key in keyof typeof formData]?: string } = {};
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    const key = name as FormKeys;
    
    if (name === 'phone') {
      const cleanValue = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: cleanValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (touched[key] && errors[key]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [key]: error,
      });
    }
  };

  const handleBlur = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    const key = name as FormKeys;
    setTouched({
      ...touched,
      [key]: true,
    });

    const error = validateField(name, value);
    if (error) {
      setErrors({
        ...errors,
        [key]: error,
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  // Function to handle login for existing users
  const handleExistingUserLogin = async (phoneNumber: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store phone number for OTP verification
        sessionStorage.setItem('loginPhone', phoneNumber);
        sessionStorage.setItem('isLogin', 'true'); // Flag to indicate this is a login flow
        
        // Navigate to OTP verification page
        navigate('/OTP', { 
          state: { 
            phoneNumber: phoneNumber,
            isLogin: true, // Pass flag to OTP page
            message: 'Welcome back! Please verify your phone number.'
          }
        });
        
        return true;
      } else {
        console.error('Login initiation failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Try to register the user
      const response = await fetch(`${BASE_URL}/api/auth/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // New user registration - OTP sent
        sessionStorage.setItem('registrationPhone', formData.phone);
        sessionStorage.setItem('registrationName', `${formData.firstName} ${formData.lastName}`);
        sessionStorage.setItem('isLogin', 'false');
        
        navigate('/OTP', { 
          state: { 
            phoneNumber: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            isLogin: false,
            message: 'An OTP has been sent to your phone number.'
          }
        });
      } else if (response.status === 409) {
        // User already exists - initiate login flow
        console.log('⚠️ User already exists. Initiating login flow...');
        
        const loginSuccess = await handleExistingUserLogin(formData.phone);
        
        if (!loginSuccess) {
          // If login initiation fails, show error
          setErrors({
            phone: 'Unable to send OTP. Please try again.',
          });
        }
      } else {
        // Other errors
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all fields are filled
  const isFormComplete = Object.values(formData).every((field) => field.trim() !== '');

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen m-0 p-0 overflow-hidden bg-white">
      {/* Left Section - Auth Form */}
      <section className="w-full bg-red lg:w-1/2 flex items-start justify-center bg-white py-8 lg:py-0 lg:items-center md:mb-36">
        <main className="flex flex-col items-start justify-center gap-8 lg:gap-24 w-[90%] md:w-[70%] lg:w-[55%] max-w-md">
          {/* Logo */}
          <p className="text-black text-xl font-bold">
            <span className="text-green-600 font-bold">Shuttle</span>
            <span className="text-amber-400 font-normal">App</span>
          </p>

          {/* Header */}
          <section className='w-full gap-6 flex flex-col'>
            <header className="flex flex-col justify-start items-start gap-1 w-full">
              <p className="text-black text-2xl font-bold">Let's get you started!</p>
              <p className="text-black/60 text-sm font-normal">Enter your details to continue</p>
            </header>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full mt-2"
              noValidate
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-sm font-medium text-black/70">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your first name"
                  className={`border rounded-lg px-4 py-3 lg:py-2 focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName && touched.firstName
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-green-600'
                  }`}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
                {errors.firstName && touched.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-sm font-medium text-black/70">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your last name"
                  className={`border rounded-lg px-4 py-3 lg:py-2 focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName && touched.lastName
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-green-600'
                  }`}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
                {errors.lastName && touched.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="text-sm font-medium text-black/70">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 0551234567"
                  className={`border rounded-lg px-4 py-3 lg:py-2 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone && touched.phone
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-green-600'
                  }`}
                  disabled={isLoading}
                  autoComplete="tel"
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Custom Primary Button */}
              <PrimaryButton
                type="submit"
                label={isLoading ? "Processing..." : "Continue"}
                disabled={!isFormComplete || isLoading}
              />
            </form>
            <div className="text-center justify-center text-black/60 text-sm font-normal">
              An OTP code will be sent to your number for verification
            </div>
          </section>
        </main>
      </section>

      {/* Right Section - Hidden on mobile */}
      <section className="hidden lg:flex w-1/2 h-full bg-neutral-50 items-center justify-center">
        {/* Your existing right section content remains unchanged */}
        <main className='flex flex-col items-center justify-center gap-6 w-[55%]'>
          {/* ... Rest of your right section JSX ... */}
        </main>
      </section>
    </div>
  );
}

export default Auth;