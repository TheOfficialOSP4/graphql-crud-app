import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true,
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
    this.roleEl = React.createRef();
  }

  switchModeHandler = () => {
    console.log('previous state: ', this.state);
    this.setState((prevState) => {
      return { isLogin: !prevState.isLogin };
    });
  };
  
  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    // console.log('---submitHandler console.logs incoming-----')
    // console.log(this.roleEl);
    // console.log(this.roleEl.current);
    // console.log(this.roleEl.current.value);
    // let role;
    // if (!this.state.isLogin) {
    //   role = this.roleEl.current.value;
    // }

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
            role
          }
        }
      `,
      variables: {
        email: email,
        password: password,
      },
    };

    if (!this.state.isLogin) {
      const role = this.roleEl.current.value;
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!, $role: String!) {
            createUser(userInput: {email: $email, password: $password, role: $role}) {
              _id
              email
              role
            }
          }
        `,
        variables: {
          email: email,
          password: password,
          role: role,
        },
      };
    }
    // send fetch request to auth endpoint 
    fetch('http://localhost:8000/auth', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: 'Bearer ' + this.context.token,
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
        // 'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
    })
      .then((res) => {
        console.log('Inside the first then statement Printing Res:', res);
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        if (resData.data.login && resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration,
            resData.data.login.role
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordEl} />
        </div>
        {this.state.isLogin ? (
          <></>
        ) : (
          <div className="form-control">
            <label htmlFor="role">Role</label>
            <input type="role" id="role" ref={this.roleEl} />
          </div>
        )}
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? 'Signup' : 'Login'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
