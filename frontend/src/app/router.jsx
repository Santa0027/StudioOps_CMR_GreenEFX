// src/app/router.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from '../config/routes.jsx';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      {publicRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {protectedRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element}>
          {route.children &&
            route.children.map((childRoute, childIndex) => (
              <Route key={childIndex} path={childRoute.path} element={childRoute.element}>
                {childRoute.children &&
                  childRoute.children.map((grandchildRoute, grandchildIndex) => (
                    <Route key={grandchildIndex} path={grandchildRoute.path} element={grandchildRoute.element}>
                        {grandchildRoute.children &&
                            grandchildRoute.children.map((greatGrandchildRoute, greatGrandchildIndex) => (
                                <Route key={greatGrandchildIndex} path={greatGrandchildRoute.path} element={greatGrandchildRoute.element} />
                            ))}
                    </Route>
                  ))}
              </Route>
            ))}
        </Route>
      ))}
       <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRouter;