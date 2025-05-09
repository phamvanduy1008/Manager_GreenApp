import {
  BrowserRouter as Router,
} from "react-router-dom";
import "./assets/css/App.css";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;