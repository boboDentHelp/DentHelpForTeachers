
import PropTypes from 'prop-types';  // Importă PropTypes
import ProtectedRoute from './ProtectedRoute';

const PatientRoute = ({ children }) => {
    return (
        <ProtectedRoute role={["PATIENT", "RADIOLOGIST"]}>
            {children}
        </ProtectedRoute>
    );
};

PatientRoute.propTypes = {
    children: PropTypes.node.isRequired // Definim tipul pentru prop-ul children
};

export default PatientRoute;
