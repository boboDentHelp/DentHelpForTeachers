
import PropTypes from 'prop-types';  // Importă PropTypes
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
    return (
        <ProtectedRoute role={["ADMIN"]}>
            {children}
        </ProtectedRoute>
    );
};

AdminRoute.propTypes = {
    children: PropTypes.node.isRequired // Definim tipul pentru prop-ul children
};

export default AdminRoute;
