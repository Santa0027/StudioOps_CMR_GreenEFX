import React from 'react';
import UserPerformanceReport from './Reports/UserPerformanceReport';
import FinanceReport from './Reports/FinanceReport';
import ProjectReport from './Reports/ProjectReport';
import TaskReport from './Reports/TaskReport';

const ReportAndAnalysis = () => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Reports and Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserPerformanceReport />
        <FinanceReport />
        <ProjectReport />
        <TaskReport />
      </div>
    </div>
  );
};

export default ReportAndAnalysis;
