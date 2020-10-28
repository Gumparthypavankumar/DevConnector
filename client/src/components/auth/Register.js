import React, { Fragment,useState} from "react";
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';
import { PropTypes } from 'prop-types';

const Register = ({setAlert}) => {
  const [formData,setFormData] = useState({
    name:'',
    email:'',
    password:'',
    password2:''
  });

  const { name,email,password,password2 } = formData;
  const onChange = (e) => setFormData({...formData,[e.target.name] : e.target.value})
  const onSubmit = (e) => {
    e.preventDefault();
    if(password !== password2){
      setAlert('Passwords Do Not Match','danger');
    }
    else{
      console.log('SUCCESS');
    }
  }
  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" name="name" style={InputStyling} value ={name} onChange={e => onChange(e)} required/>
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" style={InputStyling} name="email" value={email} onChange={e => onChange(e)} required/>
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password" 
            value={password}
            onChange={e => onChange(e)}
            style={InputStyling}
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2" 
            value={password2}
            onChange={e => onChange(e)}
            style={InputStyling}
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <a href="login.html">Sign In</a>
      </p>
    </Fragment>
  );
};

const InputStyling = {
    borderRadius:'10px'
}

Register.propTypes = {
  setAlert : PropTypes.func.isRequired
}

export default connect(null,{setAlert})(Register);
