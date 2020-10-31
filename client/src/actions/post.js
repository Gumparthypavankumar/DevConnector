import axios from 'axios';
import { stringify } from 'uuid';
import { setAlert } from './alert';
import { GET_POSTS , POST_ERROR, UPDATE_LIKES, DELETE_POST, ADD_POST, GET_POST, ADD_COMMENT, REMOVE_COMMENT} from './types';

//Get All Posts
export const getPosts = () => dispatch => {
    axios.get('/api/posts')
    .then(res => {
        dispatch({
            type : GET_POSTS,
            payload:res.data
        });
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

//Add like
export const addLike = (postId) => dispatch => {
    axios.put( `/api/posts/like/${postId}`)
    .then(res => {
        dispatch({
            type : UPDATE_LIKES,
            payload:{ id:postId,likes: res.data }
        });
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

//Remove like
export const removeLike = (postId) => dispatch => {
    axios.put( `/api/posts/unlike/${postId}`)
    .then(res => {
        dispatch({
            type : UPDATE_LIKES,
            payload:{ id: postId,likes: res.data }
        });
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

// Delete Post
export const deletePost = (postId) => dispatch => {
    axios.delete( `/api/posts/${postId}`)
    .then(res => {
        dispatch({
            type : DELETE_POST,
            payload:postId
        });

        dispatch(setAlert('Post Removed','success'));

    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

// ADD Post
export const addPost = (formData) => dispatch => {

    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }

    axios.post( '/api/posts', formData, config)
    .then(res => {
        dispatch({
            type : ADD_POST,
            payload:res.data
        });

        dispatch(setAlert('Post Created','success'));
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

//Get Post
export const getPost = (postId) => dispatch => {
    axios.get(`/api/posts/${postId}`)
    .then(res => {
        dispatch({
            type : GET_POST,
            payload:res.data
        });
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

// ADD Comment
export const addComment = (postId, formData) => dispatch => {

    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }

    axios.post(`/api/posts/comment/${postId}`, formData, config)
    .then(res => {
        dispatch({
            type : ADD_COMMENT,
            payload:res.data
        });

        dispatch(setAlert('Comment Added','success'));
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}

// Delete Comment
export const deleteComment = (postId, commentId) => dispatch => {
    axios.delete(`/api/posts/comment/${postId}/${commentId}`)
    .then(res => {
        dispatch({
            type : REMOVE_COMMENT,
            payload:commentId
        });

        dispatch(setAlert('Comment Removed','success'));
    })
    .catch(err => {
        dispatch({
            type:POST_ERROR,
            payload : { msg : err.response.statusText , status : err.response.status }
        });
    })
}