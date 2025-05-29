import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'lhg_accessToken';
const REFRESH_TOKEN_KEY = 'lhg_refreshToken';

export const storeTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const removeTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // The backend token payload
    return {
      id: decoded.id,
      email: decoded.email,
      isAnonymous: decoded.isAnonymous,
      role: decoded.role,
      isVerified: decoded.isVerified,
      preferredLanguage: decoded.preferredLanguage,
      // Any other relevant fields from the token that we want readily available
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // to get in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If error decoding, assume expired or invalid
  }
};
