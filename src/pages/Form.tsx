import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";

interface FormData {
  username: string;
  password: string;
  email: string;
}

interface LocationInfo {
  location: {
    current?: {
      type: string;
      coordinates: number[];
    };
    city: string;
    country: string;
    region: string;
    timezone: string;
  };
  deviceInfo: {
    os: string;
    browser: string;
    platform: string;
    userAgent: string;
    isMobile: boolean;
    isDesktop: boolean;
    isBot: boolean;
  };
  networkInfo: {
    ip: string;
    range: number[];
    country: string;
    region: string;
    timezone: string;
    isp: string;
    org: string;
  };
}

const defaultLocationInfo: LocationInfo = {
  location: {
    city: "",
    country: "",
    region: "",
    timezone: "",
    current: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
  deviceInfo: {
    os: "",
    browser: "",
    platform: "",
    userAgent: navigator.userAgent,
    isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
    isDesktop: !/Mobile|Android|iPhone/i.test(navigator.userAgent),
    isBot: /bot|crawler|spider|crawling/i.test(navigator.userAgent),
  },
  networkInfo: {
    ip: "",
    range: [],
    country: "",
    region: "",
    timezone: "",
    isp: "",
    org: "",
  },
};

const axiosInstance = axios.create({
  // baseURL:
  //   process.env.NODE_ENV === "production"
  //     ? "https://backendlocation-gmb4.onrender.com/api"
  //     : "http://localhost:5000/api",
  // baseURL: "https://backendlocation-gmb4.onrender.com/api",
  baseURL: "http://localhost:5000/api",
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
  // const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [locationInfo, setLocationInfo] =
    useState<LocationInfo>(defaultLocationInfo);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [preciseLocation, setPreciseLocation] = useState<boolean>(false);

  useEffect(() => {
    getUserLocation();
    getNetworkInfo();
  }, []);

  const getNetworkInfo = async () => {
    try {
      const response = await axiosInstance.get("/location/network-info");
      if (response.data) {
        setLocationInfo((prevInfo) => ({
          ...prevInfo,
          networkInfo: {
            ...prevInfo.networkInfo,
            ...response.data.networkInfo,
          },
        }));
      }
    } catch (error) {
      console.error("Network info fetch failed:", error);
    }
  };

  const getUserLocation = () => {
    setLocationStatus("Detecting location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          // setCoordinates(coords);
          setPreciseLocation(true);
          setLocationStatus("Precise location detected");

          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
            );
            const address = response.data.address;

            setLocationInfo((prevInfo) => ({
              ...prevInfo,
              location: {
                ...prevInfo.location,
                city: address.city || address.town || "Unknown",
                country: address.country || "Unknown",
                region: address.state || "Unknown",
                current: {
                  type: "Point",
                  coordinates: [coords.longitude, coords.latitude],
                },
              },
            }));
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus("Location access denied. Using IP-based location.");
          setPreciseLocation(false);
          // Fallback to IP-based location from your backend
          getFallbackLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by your browser");
      setPreciseLocation(false);
      getFallbackLocation();
    }
  };

  const getFallbackLocation = async () => {
    try {
      const response = await axiosInstance.get("/location/ip-info");
      if (response.data) {
        setLocationInfo((prevInfo) => ({
          ...prevInfo,
          location: {
            ...prevInfo.location,
            ...response.data.location,
          },
        }));
      }
    } catch (error) {
      console.error("IP location fallback failed:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/register", {
        ...formData,
        coordinates: locationInfo.location.current?.coordinates,
        preciseLocation,
        locationInfo,
      });
      console.log("Registration successful:", response.data);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Registration failed");
      } else {
        setError("An unexpected error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocationLabel = () => {
    return preciseLocation
      ? "📍 Using precise location"
      : "📍 Using approximate location";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getLocationLabel()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {locationStatus && (
            <div
              className={`mb-4 text-sm text-center ${
                preciseLocation ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {locationStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {locationInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Location Details:
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>
                    <p className="text-sm text-gray-900">
                      {locationInfo.location.city},{" "}
                      {locationInfo.location.region}
                    </p>
                    <p className="text-sm text-gray-900">
                      {locationInfo.location.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Network</p>
                    <p className="text-sm text-gray-900">
                      {locationInfo.networkInfo.isp || "Unknown ISP"}
                    </p>
                    <p className="text-sm text-gray-900">
                      {locationInfo.networkInfo.org || "Unknown Organization"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
