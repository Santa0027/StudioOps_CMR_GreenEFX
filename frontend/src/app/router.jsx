// src/app/router.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from '../config/routes.jsx';

const AppRouter = () => {
  const renderRoutes = (routes) => {
    return routes.map((route, index) => {
      const { path, element, children, index: isIndex } = route;
      
      if (isIndex) {
        return <Route key={index} index element={element} />;
      }

      return (
        <Route key={index} path={path} element={element}>
          {children && renderRoutes(children)}
        </Route>
      );
    });
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      {renderRoutes(publicRoutes)}
      {renderRoutes(protectedRoutes)}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRouter;
