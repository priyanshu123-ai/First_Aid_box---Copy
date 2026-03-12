import React, { useContext, useState } from "react";
import { Heart, Mail, Lock, User } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Input = ({ className = "", ...props }) => (
  <input
    className={`border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Register = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [qrCode, setQrCode] = useState(null); // store QR code after login or signup
  const [showQr, setShowQr] = useState(false); // show QR page after login or signup
  const [isLoading, setIsLoading] = useState(false);

  const { getStatus } = useContext(AuthContext);

  // Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/login",
        {
          email: signInEmail,
          password: signInPassword,
        },
        { withCredentials: true }
      );

      toast.success("Signed in successfully!");
      setQrCode(response.data.qrCode); // store QR code
      setShowQr(true); // show QR code
      getStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign In failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/register",
        {
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
        },
        { withCredentials: true }
      );
      toast.success("Account created successfully!");
      setQrCode(response.data.qrCode); // store QR code
      setShowQr(true); // show QR code
      getStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign Up failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Download QR code
  const downloadQrCode = () => {
    if (!qrCode) return;
    const a = document.createElement("a");
    a.href = qrCode;
    a.download = "profile_qr.png";
    a.click();
  };

  const goHome = () => navigate("/");

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-red-600" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Emergency Aid</h1>
          <p className="text-gray-600 text-lg">
            Access your medical profile and emergency tools
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          {showQr ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Your QR Code</h2>
              <img
                src={qrCode}
                alt="User QR Code"
                className="mx-auto mb-4 w-48 h-48"
              />
              <div className="flex flex-col gap-2">
                <Button onClick={downloadQrCode}>Download QR Code</Button>
                <Button onClick={goHome}>Go to Home</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="grid grid-cols-2 rounded-lg bg-gray-100 mb-6">
                <button
                  onClick={() => setActiveTab("signin")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${activeTab === "signin"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500"
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${activeTab === "signup"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500"
                    }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Sign In Form */}
              {activeTab === "signin" && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing up..." : "Create Account"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
