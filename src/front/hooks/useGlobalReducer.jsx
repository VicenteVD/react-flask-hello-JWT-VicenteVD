import React, { createContext, useContext, useEffect, useReducer } from "react";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const initialState = {
  token: localStorage.getItem("token") || "",
  user: null,
  loadingUser: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, token: action.payload.token, user: action.payload.user };
    case "LOGOUT":
      return { ...state, token: "", user: null };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOADING_USER":
      return { ...state, loadingUser: action.payload };
    default:
      return state;
  }
}

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Al cargar (o cuando cambie token), traemos /api/me
  // useEffect(() => {
  //   const fetchMe = async () => {
  //     if (!state.token) {
  //       dispatch({ type: "SET_USER", payload: null });
  //       return;
  //     }
  //     try {
  //       dispatch({ type: "LOADING_USER", payload: true });
  //       const res = await fetch(`${BASE}/api/me`, {
  //         headers: { Authorization: `Bearer ${state.token}` },
  //       });
  //       if (!res.ok) throw new Error("No autorizado");
  //       const data = await res.json();
  //       dispatch({ type: "SET_USER", payload: data });
  //     } catch (e) {
  //       // token inválido
  //       dispatch({ type: "LOGOUT" });
  //       // localStorage.removeItem("token");
  //     } finally {
  //       dispatch({ type: "LOADING_USER", payload: false });
  //     }
  //   };
  //   fetchMe();
  // }, [state.token]);

  // Acciones de auth
  const actions = {
    loginSuccess: (data) => {
      console.log("data", data);
      localStorage.setItem("token", data.access_token);
      dispatch({ type: "LOGIN_SUCCESS", payload: { token: data.access_token, user: data.user } });
    },
    logout: () => {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
    },
    setUser: (user) => dispatch({ type: "SET_USER", payload: user }),
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}
