import React, { Fragment,useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
//CSS
import "./App.css";

//Components
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Alert from "./components/layout/Alert";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

//Provider from react-redux
import { Provider } from "react-redux";

//Redux Store
import store from "./store";

import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
if(localStorage.getItem('token')){
  setAuthToken(localStorage.getItem('token'));
}

const App = () => {
  useEffect(()=>{
    return store.dispatch(loadUser())
  },[]);

  return (
    <Provider store={ store }>
      <Router>
        <Fragment>
          <Navbar/>
          <Route exact path="/" component={ Landing }></Route>
          <section className="container">
            <Alert/>
            <Switch>
              <Route exact path="/register" component={ Register }></Route>
              <Route exact path="/login" component={Login}></Route>
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
