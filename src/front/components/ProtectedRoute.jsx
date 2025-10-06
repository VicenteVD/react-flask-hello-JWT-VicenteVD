import { Navigate } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

export default function ProtectedRoute({ children }) {
  const { state } = useStore();
  if (!state.token) return <Navigate to="/auth" replace />;
  return children;
}
