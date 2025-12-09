import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';  // Importă PropTypes
import { parseJwt } from '../service/authService.jsx';

const ProtectedRoute = ({ role, children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    const decodedToken = parseJwt(token);

    if (!decodedToken || !role.includes(decodedToken.role)) {
        return <Navigate to="/not-authorized" />;
    }

    return children;
};

// Definim tipurile de prop-uri pentru ProtectedRoute
ProtectedRoute.propTypes = {
    role: PropTypes.string.isRequired, // Rolul este obligatoriu și trebuie să fie un string
    children: PropTypes.node.isRequired // children trebuie să fie un nod React (element, componentă, etc.)
};

export default ProtectedRoute;
