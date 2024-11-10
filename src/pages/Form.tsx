import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";

interface FormData {
  username: string;
  password: string;
  email: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationInfo {
  location: {
    city: string;
    country: string;
    street: string;
    region: string;
    timezone: string;
    postcode: string;
  };
  deviceInfo: {
    os: string;
    browser: string;
    platform: string;
    isMobile: boolean;
    isDesktop: boolean;
  };
  networkInfo: {
    ip: string;
    isp: string;
    org: string;
  };
}

const axiosInstance = axios.create({
  baseURL: "https://backendlocation-gmb4.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    email: "",
  });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");

  useEffect(() => {
    getUserLocation();
  }, []);

  console.log(coordinates);

  const getUserLocation = () => {
    setLocationStatus("Detecting location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus("Location detected");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus("Location access denied. Using IP-based location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/register", {
        ...formData,
        coordinates: coordinates,
      });
      setLocationInfo(response.data.locationInfo);
      console.log("Registration successful:", response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Registration failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {locationStatus && (
            <div className="mb-4 text-sm text-gray-600 text-center">
              {locationStatus}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {locationInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Location Info:
                </h3>
                <p className="text-sm text-gray-600">
                  Address: {locationInfo.location.street},{" "}
                  {locationInfo.location.city}
                </p>
                <p className="text-sm text-gray-600">
                  Region: {locationInfo.location.region},{" "}
                  {locationInfo.location.country}
                </p>
                <p className="text-sm text-gray-600">
                  Postal Code: {locationInfo.location.postcode}
                </p>
                <p className="text-sm text-gray-600">
                  Timezone: {locationInfo.location.timezone}
                </p>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Device Info:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {locationInfo.deviceInfo.os} -{" "}
                    {locationInfo.deviceInfo.browser} (
                    {locationInfo.deviceInfo.platform})
                  </p>
                  <p className="text-sm text-gray-600">
                    Device Type:{" "}
                    {locationInfo.deviceInfo.isMobile ? "Mobile" : "Desktop"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Network Info:
                  </h4>
                  <p className="text-sm text-gray-600">
                    ISP: {locationInfo.networkInfo.isp}
                  </p>
                  <p className="text-sm text-gray-600">
                    Organization: {locationInfo.networkInfo.org}
                  </p>
                </div>
              </div>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
