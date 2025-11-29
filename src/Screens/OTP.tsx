import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';

function OTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const BASE_URL = 'https://shuttle-backend-0.onrender.com';
  
  // Get data from location state or sessionStorage
  const phoneNumber = location.state?.phoneNumber || 
                      sessionStorage.getItem('registrationPhone') || 
                      sessionStorage.getItem('loginPhone');
  
  const isLogin = location.state?.isLogin || 
                  sessionStorage.getItem('isLogin') === 'true';
  
  const firstName = location.state?.firstName || '';
  const lastName = location.state?.lastName || '';
  const message = location.state?.message || 'Enter the OTP sent to your phone';

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      
      // Focus last filled input or last input
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin 
        ? `${BASE_URL}/api/auth/user/login`
        : `${BASE_URL}/api/auth/user/register`;

      const body = isLogin
        ? { phoneNumber }
        : { firstName, lastName, phoneNumber };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setResendTimer(60);
        setCanResend(false);
        alert('OTP has been resent to your phone number');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Unable to resend OTP. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin
        ? `${BASE_URL}/api/auth/user/login/verify`
        : `${BASE_URL}/api/auth/user/register/verify`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        // Clear session storage
        sessionStorage.removeItem('registrationPhone');
        sessionStorage.removeItem('loginPhone');
        sessionStorage.removeItem('registrationName');
        sessionStorage.removeItem('isLogin');

        // Show success message
        alert(isLogin 
          ? 'Login successful! Welcome back.' 
          : 'Registration successful! Welcome to ShuttleApp.'
        );

        // Navigate to home/dashboard
        navigate('/home'); // Change this to your actual home route
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Unable to verify OTP. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <main className="w-full max-w-md">
        {/* Logo */}
        <p className="text-black text-xl font-bold mb-8">
          <span className="text-green-600 font-bold">Shuttle</span>
          <span className="text-amber-400 font-normal">App</span>
        </p>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-black text-2xl font-bold mb-2">
            {isLogin ? 'Welcome Back!' : 'Verify Your Number'}
          </h1>
          <p className="text-black/60 text-sm">
            {message}
          </p>
          <p className="text-black/60 text-sm mt-1">
            Sent to: <span className="font-semibold text-green-600">{phoneNumber}</span>
          </p>
        </header>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* OTP Input */}
          <div className="flex gap-2 justify-between">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-green-600 focus:border-green-600'
                }`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            label={isLoading ? "Verifying..." : "Verify OTP"}
            disabled={!isOtpComplete || isLoading}
          />

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-green-600 font-medium text-sm hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-black/60 text-sm">
                Resend OTP in <span className="font-semibold text-green-600">{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-black/60 text-sm hover:text-black transition-colors"
            disabled={isLoading}
          >
            ← Back to registration
          </button>
        </form>
      </main>
    </div>
  );
}

export default OTP;