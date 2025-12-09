export const parseJwt = (token) => {
    if (!token) {
        return null;
    }

    try {
        const base64Url = token.split('.')[1];  // Extrage partea payload a token-ului
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');  // Înlocuiește caracterele specifice URL-urilor
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);  // Parsează payload-ul în format JSON
    } catch (error) {
        console.error("Error decoding JWT", error);
        return null;
    }
};

export const isTokenValid = (token) => {
    const decodedToken = parseJwt(token);  // Decodificăm token-ul
    if (!decodedToken) {
        return false;
    }

    const currentTime = Date.now() / 1000;  // Timpul curent în secunde
    return decodedToken.exp > currentTime;  // Comparăm timpul de expirare cu timpul curent
};


export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false; // Nu există token, utilizatorul nu este autentificat
    return isTokenValid(token);
};