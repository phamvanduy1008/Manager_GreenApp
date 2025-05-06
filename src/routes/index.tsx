// routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import Message from "../pages/message/Message";
import Order from "../pages/order/Order";
import Price from "../pages/price/Price";
import Product from "../pages/product/Product";
import NotFound from "../pages/NotFound";
import Login from "../features/auth/Login";
import PrivateRoute from "../components/PrivateRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Home />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/product"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Product />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/order"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Order />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/price"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Price />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/message"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Message />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
