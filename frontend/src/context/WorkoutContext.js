import { createContext, useReducer } from "react";
import axios from "axios";

export const WorkoutsContext = createContext();

const workoutsAxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/workouts",
});

workoutsAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const workoutsReducer = (state, action) => {
  switch (action.type) {
    case "SET_WORKOUTS":
      return {
        workouts: Array.isArray(action.payload) ? action.payload : [],
      };
    case "CREATE_WORKOUT":
      return {
        workouts: [action.payload, ...(state.workouts || [])],
      };
    case "DELETE_WORKOUT":
      return {
        workouts: state.workouts.filter((w) => w._id !== action.payload._id),
      };
    case "UPDATE_WORKOUT":
      return {
        workouts: state.workouts.map((w) =>
          w._id === action.payload._id ? action.payload : w
        ),
      };
    case "RESET_WORKOUTS":
      return { workouts: [] };
    default:
      return state;
  }
};


export const WorkoutsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workoutsReducer, {
    workouts: [],
  });

  return (
    <WorkoutsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WorkoutsContext.Provider>
  );
};
