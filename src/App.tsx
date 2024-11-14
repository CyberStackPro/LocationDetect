// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LocationForm from "./pages/LocationForm";
import LocationRegistration from "./pages/LocationRegistration";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/register" replace />} /> */}
        <Route path="*" element={<LocationRegistration />} />
        <Route path="/location-form" element={<LocationForm />} />
        {/* <Route path="*" element={<Navigate to="/register" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
