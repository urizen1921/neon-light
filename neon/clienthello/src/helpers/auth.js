import cookie from 'js-cookie';
import { GoogleLogout } from 'react-google-login';

//Set in Cookies
export const setCookie = (key, value) => {
  if(window !== 'undefined') {
    cookie.set(key, value, {
      // 1Day
      expires: 1
    });
  }
};

//Remove from cookie
export const removeCookie = (key) => {
  if(window !== 'undefined') {
    cookie.remove(key, {
      expires: 1
    });
  }
};

// Get from cookie such as stored token
// Will be useful when we need to make request to server with token
export const getCookie = (key) => {
  if(window !== 'undefined') {
    return cookie.get(key);
  }
};


//Set in localstorage
export const setLocalStorage = (key, value) => {
  if(window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

//Remove from localStorage
export const removeLocalStorage = (key) => {
  if(window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

//Auth user after login
export const authenticate = (response, next) => {
  setCookie('token', response.data.token);
  setLocalStorage('user', response.data.user);
  next();
};

//Signout
export const signout = (next) => {
  removeCookie('token');
  removeLocalStorage('user');
  next();
};

//Get user info from localstorage
export const isAuth = () => {
  if(window !== 'undefined') {
    const cookieChecked = getCookie('token');
    if(cookieChecked) {
      if(localStorage.getItem('user')) {
        return JSON.parse(localStorage.getItem('user'));
      } else {
        return false;
      }
    }
  }
};

//update user data in localStorage
export const updateUser = (response, next) => {
  if(window !== 'undefined') {
    let auth = JSON.parse(localStorage.getItem('user'));
    auth = response.data;
    localStorage.setItem('user', JSON.stringify(auth));
  }
  next();
};

