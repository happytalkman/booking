import React from 'react';
import RealTimeDataDashboard from '../components/RealTimeDataDashboard';

interface RealTimeDataProps {
  lang: 'ko' | 'en';
}

const RealTimeData: React.FC<RealTimeDataProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <RealTimeDataDashboard lang={lang} />
    </div>
  );
};

export default RealTimeData;