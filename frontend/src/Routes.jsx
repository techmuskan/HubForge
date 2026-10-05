import {Navigate, useRoutes} from 'react-router-dom';

// pages list
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Repository from "./components/repository/Repository";
import CreateRepository from "./components/repository/CreateRepository";
import Landing from "./components/landing/Landing";

// auth context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
   const { currentUser } = useAuth();

   const guarded = (element) => currentUser ? element : <Navigate to="/auth" replace />;
   const guest = (element) => currentUser ? <Navigate to="/dashboard" replace /> : element;

   let element = useRoutes([
    {
        path: "/",
        element: <Landing />
    },{
        path: "/dashboard",
        element: guarded(<Dashboard/>)
    },{
        path: "/auth",
        element: guest(<Login/>)
    },{
        path: "/signup",
        element: guest(<SignUp/>)
    },{
        path: "/profile",
        element: guarded(<Profile/>)
    },{
        path: "/create", element: guarded(<CreateRepository />)
    },{
        path: "/repository/:id", element: guarded(<Repository />)
    }, { path: "*", element: <Navigate to={currentUser ? "/dashboard" : "/"} replace /> }
   ]);

   return element;
}

export default ProjectRoutes;
