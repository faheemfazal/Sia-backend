import { postlogin } from "../Api/Login";
import Otp from "../components/Modal/Otp";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { TailSpin } from "react-loader-spinner";

export default function Login() {
  const [inputValue, setInputValue] = useState('');
  const [mailOrPhone, setMailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [otp, setOtp] = useState(false);
  const [loading, setLoading] = useState(false); // Add a state for loading

  const validateInput = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (emailRegex.test(value)) {
      setMailOrPhone('email');
      return true;
    } else if (phoneRegex.test(value)) {
      setMailOrPhone('number');
      return true;
    } else {
      setError('Please enter a valid email address or phone number.');
      return false;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError(''); // Clear previous error
    validateInput(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInput(inputValue)) {
      return;
    }
    if (loading) return; // Prevent multiple requests
    setLoading(true); // Set loading to true

    try {
      const res = await postlogin(inputValue, mailOrPhone);
      if (res.status === 200) {
        setOtp(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMsg('An error occurred during login.');
    } finally {
      setLoading(false); // Set loading to false after request is complete
    }
  };

  return (
    <div className="h-full w-full">
      <Navbar />
      {otp? (
        <Otp inputValue={inputValue} mailOrPhone={mailOrPhone} setOtp={setOtp} handleLogin={handleLogin} />
      ) : (
        <div className="flex h-96 items-center justify-center sm:mx-0 md:mx-12 mx-2 my-3">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Login/ Sign Up</h2>
            <h2 className="text-lg mb-6">Using OTP</h2>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="flex flex-col items-start">
                <input
                  id="otp"
                  name="otp"
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter Phone number/ Email Id"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {error && <div className="text-red-500 mt-4">{error}</div>}
              <button type="submit" className="w-full text-[#63247d] hover:text-white hover:bg-[#63247d] border-[#63247d] py-2 rounded border-2 transition-colors">
                {loading? (
                  <div className="flex justify-center">
                    <TailSpin color="white" height={20} width={20} />
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}