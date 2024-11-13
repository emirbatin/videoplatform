import React, { useContext } from 'react';
import { AuthContext } from '../Contexts/authContext';

const LogoutButton = () => {
    const { handleLogout } = useContext(AuthContext);

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
