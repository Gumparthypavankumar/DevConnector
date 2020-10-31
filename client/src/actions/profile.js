import axios from "axios";
import { setAlert } from "./alert";
import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE, ACCOUNT_DELETED,CLEAR_PROFILE,GET_PROFILES,GET_REPOS} from "./types";

export const getCurrentProfile = () => (dispatch) => {
  axios
    .get("/api/profile/me")
    .then((res) => {
      dispatch({
        type: GET_PROFILE,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    });
};

// Get all profiles
export const getProfiles = () => dispatch => {
  dispatch({ type:CLEAR_PROFILE });

  axios.get('/api/profile')
  .then(res => {
    dispatch({
      type:GET_PROFILES,
      payload:res.data
    });
  })
  .catch(err => {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  })
}

//Get Profile By id
export const getProfileById = (userId) => dispatch => {
  axios.get(`/api/profile/user/${userId}`)
  .then(res => {
    dispatch({
      type:GET_PROFILE,
      payload:res.data
    })
  })
  .catch(err => {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  })
};

// Get Github Repos
export const getGithubRepos = (username) => dispatch => {
  axios.get(`/api/profile/github/${username}`)
  .then(res => {
    dispatch({
      type: GET_REPOS,
      payload:res.data
    })
  })
  .catch(err => {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  })
}

// Create or update profile
export const createProfile = (formData, history, edit = false) => (
  dispatch
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  axios
    .post("/api/profile", formData, config)
    .then((res) => {
      dispatch({
        type: GET_PROFILE,
        payload: res.data,
      });
      dispatch(
        setAlert(edit ? "Profile Updated" : "Profile Created", "success")
      );
      if (!edit) {
        history.push("/dashboard");
      }
    })
    .catch((err) => {
      const errors = err.response.data.errors;
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));

      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    });
};

//ADD Experience
export const addExperience = (formData, history) => (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  axios
    .put("/api/profile/experience", formData, config)
    .then((res) => {
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });
      dispatch(setAlert("Experience Added", "success"));
      history.push("/dashboard");
    })
    .catch((err) => {
      const errors = err.response.data.errors;
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));

      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    });
};

//ADD Education
export const addEducation = (formData, history) => (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  axios
    .put("/api/profile/education", formData, config)
    .then((res) => {
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });
      dispatch(setAlert("Education Added", "success"));
      history.push("/dashboard");
    })
    .catch((err) => {
      const errors = err.response.data.errors;
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));

      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    });
};

//Delete Experience
export const deleteExperience = (id) => (dispatch) => {
  axios
    .delete(`/api/profile/experience/${id}`)
    .then((res) => {
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });
      dispatch(setAlert("Experience Removed", "success"));
    })
    .catch((err) => {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    });
};

//Delete Education
export const deleteEducation = (id) => (dispatch) => {
  axios
    .delete(`/api/profile/education/${id}`)
    .then((res) => {
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data,
      });
      dispatch(setAlert("Education Removed", "success"));
    })
    .catch((err) => {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    });
};

//Delete Account & Profile
export const deleteAccount = () => (dispatch) => {
  if (window.confirm("Are You Sure to continue? This cannot be undone!")) {
    axios
      .delete("/api/profile")
      .then((res) => {
        dispatch({type: CLEAR_PROFILE});
        dispatch({type: ACCOUNT_DELETED});
        dispatch(setAlert('Your Account has been Permanently Deleted'));
      })
      .catch((err) => {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
      });
  }
};

