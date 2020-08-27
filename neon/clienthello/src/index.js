import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import App from './App.jsx';
import Register from './views/register.jsx';
import Login from './views/login.jsx';
import ForgetPassword from './views/forget-password.jsx';
import Activate from './views/activate.jsx';
import Reset from './views/reset.jsx';
import Private from './views/private.jsx';
import Timeline from './views/timeline.jsx';

import PrivateRoute from './routes/private-route.jsx'


import 'react-toastify/dist/ReactToastify.css';

ReactDOM.render(

    <BrowserRouter>
      <Switch>
        <Route path='/' exact render={props => <App {...props}/>}/>
        <Route path='/login' exact render={props => <Login {...props} />} />
        <Route path='/register' exact render={props => <Register {...props} />} />
        <Route path='/users/password/forget' exact render={props => <ForgetPassword {...props} />} />
        <Route path='/users/activate/:token' exact render={props => <Activate {...props} />} />
        <Route path='/users/password/reset/:token' exact render={props => <Reset {...props} />} />
        <PrivateRoute path="/private" exact component={Private} />
        <PrivateRoute path="/timeline" exact component={Timeline} />
      </Switch>
    </BrowserRouter>,
  document.getElementById('root')
);

