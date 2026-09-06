import React, { createContext, useContext, useState, useEffect } from 'react';

interface FeatureContextType {
  features: {
    payments: boolean;
    routines: boolean;
    attendance: boolean;
  };
  loading: boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState({
    payments: true,
    routines: true,
    attendance: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from Vite environment variables (VITE_MODULE_PAYMENTS_ENABLED, etc.)
    // If not set, default to true.
    const envPayments = import.meta.env.VITE_MODULE_PAYMENTS_ENABLED;
    const envRoutines = import.meta.env.VITE_MODULE_ROUTINES_ENABLED;
    const envAttendance = import.meta.env.VITE_MODULE_ATTENDANCE_ENABLED;

    setFeatures({
      payments: envPayments !== undefined ? envPayments === 'true' : true,
      routines: envRoutines !== undefined ? envRoutines === 'true' : true,
      attendance: envAttendance !== undefined ? envAttendance === 'true' : true,
    });
    setLoading(false);
  }, []);

  return (
    <FeatureContext.Provider value={{ features, loading }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};
