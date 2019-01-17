import { httpApiUrl, wsApiUrl } from '../core/api';
import React, {Component} from 'react';
import {Provider} from './context';
import {getLogger} from "../core/utils";

import { AsyncStorage } from "react-native"
import {Login} from './Login'
const log = getLogger('AuthProvider');
const ACCESS_TOKEN = "token";

export class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      issue: null,
      token: null,
    };
    //this.handleLogin.bind(this)
  }

  async storeToken(accessToken) {
      try{
          await AsyncStorage.setItem(ACCESS_TOKEN, accessToken);
          log(accessToken)
          //this.getToken();
      } catch(error) {
        log("something went wrong");
      }
  }

  async getToken() {
    try{
        let token = await AsyncStorage.getItem(ACCESS_TOKEN);
        log('token is ' + token);
    } catch(error) {
      log("something went wrong");
    }
}

  componentDidMount() {
    log('componentDidMount');
    // try{
    //   const token = await AsyncStorage.getItem("token");
    //   log(token)
    //   this.setState({token, isLoading:false});
    // } catch(err){}
  }

  componentWillUnmount() {
    log('componentWillUnmount');
  }

  handleSignUp=(username,password)=>{
    this.setState({ isLoading: false, issue: null });
    fetch(`${httpApiUrl}/api/v1/users/addUser`, {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password}), // body data type must match "Content-Type" header
    })
    .then((response) => {
        if(response.status===200) {
            alert("Sign Up succesfull")
        }
        else{ alert("Sign Up failed - Server Error !!"); }
    
    }) 
    // .then(({ token }) => alert(token))    //TODO +save local (on disc)
    .catch(error => this.setState({ isLoading: false, issue: error }));   // TODO
  }

  handleLogin = (username, password) => {
    this.setState({ isLoading: false, issue: null });
    fetch(`${httpApiUrl}/login`, {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password}), // body data type must match "Content-Type" header
    })
    .then((response) => {
        if(response.status===200) {
            //alert("da")
            var tok =  response.headers.map.authorization.toString();
            this.setState({ isLoading: false, token: tok })
            this.storeToken(tok);
           // log(tok)
        }
        else{ alert("Invalid credentials"); }
    
    }) 
    // .then(({ token }) => alert(token))    //TODO +save local (on disc)
    .catch(error => this.setState({ isLoading: false, issue: error }));   // TODO
  };

  render() {
    const {issue, isLoading, token} = this.state
    return (
      <Provider value={{ token }}>
        { token && !isLoading
          ? this.props.children
          : <Login 
              isLoading={isLoading}
              issue={ issue}
              onSignUp={ (username,password)=> this.handleSignUp(username,password) }
              onLogin={(username,password)=> this.handleLogin(username,password) }/>}
      </Provider>
    );
  }
}