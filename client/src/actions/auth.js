import axios from 'axios';
import { REGISTER_SUCCESS,REGISTER_FAIL,USER_LOADED,AUTH_ERROR,LOGIN_SUCCESS,LOGIN_FAIL,LOG_OUT,CLEAR_PROFILE } from '../actions/types';
import { setAlert } from '../actions/alert';
import setAuthToken from '../utils/setAuthToken';

//LOAD USER
export const loadUser = () => dispatch => {
    if(localStorage.token){
        setAuthToken(localStorage.token);
    }

    axios.get('api/auth')
    .then(res => {
        dispatch({
            type:USER_LOADED,
            payload:res.data
        });
    })
    .catch(err => {
        dispatch({
            type:AUTH_ERROR
        });
    })
}

//Register user
export const register = ({name,email,password}) => dispatch => {
    const config = {
        headers:{
            'Content-Type':'application/json'
        }
    }

    const body = JSON.stringify({name,email,password});

    axios.post('/api/users',body,config)
    .then(res => {
        dispatch({
            type:REGISTER_SUCCESS,
            payload:res.data
        })
        dispatch(loadUser());
    })
    .catch(err => {
        const errors = err.response.data.errors;
        errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
        dispatch({
            type:REGISTER_FAIL
        })
    })
}

//Login user
export const login = (email,password) => dispatch => {
    const config = {
        headers:{
            'Content-Type':'application/json'
        }
    }

    const body = JSON.stringify({email,password});

    axios.post('/api/auth',body,config)
    .then(res => {
        dispatch({
            type:LOGIN_SUCCESS,
            payload:res.data
        })
        dispatch(loadUser());
    })
    .catch(err => {
        const errors = err.response.data.errors;
        errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
        dispatch({
            type:LOGIN_FAIL
        })
    })
}

//Logout user
export const logout = () => dispatch => {
    dispatch({
        type:LOG_OUT
    })
    dispatch({
        type:CLEAR_PROFILE
    })
}