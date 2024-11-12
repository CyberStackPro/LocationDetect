import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface FormData {
  username: string;
  password: string;
  email: string;
}
interface DeviceInfo {
  browser: string;
  os: string;
  platform: string;
  userAgent: string;
  isMobile: boolean;
}

interface LocationInfo {
  location: {
    current: {
      type: string;
      coordinates: [number, number];
    };
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  networkInfo: {
    ip: string;
    isp: string;
    org: string;
    country: string;
    region: string;
    timezone: string;
    range?: number[];
  };
  deviceInfo: DeviceInfo;
}

const defaultLocationInfo: LocationInfo = {
  location: {
    current: {
      type: "Point",
      coordinates: [0, 0],
    },
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    timezone: "Unknown",
  },
  networkInfo: {
    ip: "",
    isp: "Unknown",
    org: "Unknown",
    country: "Unknown",
    region: "Unknown",
    timezone: "Unknown",
  },
  deviceInfo: {
    browser: "Unknown",
    os: "Unknown",
    platform: "Unknown",
    userAgent: "Unknown",
    isMobile: false,
  },
};
const axiosInstance = axios.create({
  // baseURL:
  //   process.env.NODE_ENV === "production"
  //     ? "https://backendlocation-gmb4.onrender.com/api"
  //     : "http://localhost:5000/api",
  baseURL: "https://backendlocation-gmb4.onrender.com/api",
  //   baseURL: "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const LocationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    email: "",
  });
  const [coordinates, setCoordinates] = useState<{
    coords: {
      longitude: number; // Corrected spelling here
      latitude: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [locationInfo, setLocationInfo] =
    useState<LocationInfo>(defaultLocationInfo);
  const [locationStatus, setLocationStatus] = useState<string>("");

  useEffect(() => {
    getLocationInfo();
  }, []);

  const getLocationInfo = async () => {
    setLocationStatus("Detecting location...");

    try {
      // Try GPS first
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          }
        );

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCoordinates({ coords });

        // Send precise coordinates to backend
        const response = await axiosInstance.post(
          "/location/update-coordinates",
          {
            coordinates: [coords.longitude, coords.latitude],
          }
        );

        if (response.data) {
          setLocationInfo(response.data);
          setLocationStatus("Precise location detected");
          return;
        }
      }
    } catch (error) {
      console.warn(
        "Precise location detection failed, falling back to IP-based location"
      );
    }

    try {
      // Fallback to IP-based location
      const response = await axiosInstance.get("/location/network-info");
      if (response.data) {
        setLocationInfo(response.data);
        setLocationStatus("Using approximate location");
      }
    } catch (fallbackError) {
      console.error("Location detection failed:", fallbackError);
      setLocationStatus("Could not detect location");
      setLocationInfo(defaultLocationInfo);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/register", {
        ...formData,
        locationInfo,
      });

      console.log("Registration successful:", response.data);
      // Add success handling here (e.g., redirect or show success message)
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          📍 {locationStatus}
        </p>
        <div className="">
          <p className="mt-2 text-center text-sm text-gray-900 font-bold">
            Latitude 📍 {coordinates?.coords?.latitude}
          </p>
          <p className="mt-2 text-center text-sm text-gray-900 font-bold">
            Longitude 📍 {coordinates?.coords?.longitude}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

            {locationInfo && <LocationDisplay locationInfo={locationInfo} />}

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
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

export default LocationForm;

const LocationDisplay: React.FC<{ locationInfo: LocationInfo }> = ({
  locationInfo,
}) => (
  <div className="mt-4 p-4 bg-gray-50 rounded-md">
    <h3 className="text-sm font-medium text-gray-700 mb-2">
      Location Details:
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">Location</p>
        <p className="text-sm text-gray-900">
          {locationInfo.location.city === "Unknown" ? (
            <span className="text-yellow-600">Location not precise</span>
          ) : (
            `${locationInfo.location.city}, ${locationInfo.location.region}`
          )}
        </p>
        <p className="text-sm text-gray-900">{locationInfo.location.country}</p>
        <p className="text-xs text-gray-500">
          Timezone: {locationInfo.location.timezone}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">Network</p>
        <p className="text-sm text-gray-900">
          {locationInfo.networkInfo.isp !== "Unknown"
            ? locationInfo.networkInfo.isp
            : "ISP information not available"}
        </p>
        <p className="text-sm text-gray-900">
          {locationInfo.networkInfo.org !== "Unknown"
            ? locationInfo.networkInfo.org
            : "Organization not available"}
        </p>
        <p className="text-xs text-gray-500">
          IP: {locationInfo.networkInfo.ip || "Not available"}
        </p>
      </div>
    </div>

    {locationInfo.location.current.coordinates[0] !== 0 && (
      <div className="mt-2 text-xs text-gray-500">
        Coordinates: {locationInfo.location.current.coordinates[1].toFixed(4)},{" "}
        {locationInfo.location.current.coordinates[0].toFixed(4)}
      </div>
    )}

    <div className="mt-2 text-xs text-gray-500">
      Device: {locationInfo.deviceInfo.browser} on {locationInfo.deviceInfo.os}
    </div>
  </div>
);
