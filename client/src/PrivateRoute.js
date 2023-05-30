import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ path, element: Element, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      path={path}
      element={isAuthenticated ? (
        <Element />
      ) : (
        <Navigate to="/" replace />
      )}
    />
  );
};

export default PrivateRoute;
