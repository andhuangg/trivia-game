import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getEmail } from '../redux/actions/action';
import './Login.css';
import logo from '../images/logo.svg';

class Login extends Component {
  state = {
    email: '',
    name: '',
    loading: false,
  };

  handleChange = ({ target }) => {
    const { name, value } = target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.handleAPI();
    this.setState({ loading: true });
  };

  handleAPI = async () => {
    const { email, name } = this.state;
    const { dispatch, history } = this.props;

    try {
      dispatch(getEmail(email, name));
      const response = await fetch('https://opentdb.com/api_token.php?command=request');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      history.push('/game');
    } catch (error) {
      localStorage.removeItem('token');
      history.push('/');
    }
  };

  render() {
    const { email, name, loading } = this.state;
    return (
      <div className="login-container">
        <img src={ logo } alt="logo" />
        <form className="form" onSubmit={ this.handleSubmit }>
          <label className="label" htmlFor="">
            Email
            <input
              className="input"
              type="email"
              value={ email }
              name="email"
              onChange={ this.handleChange }
              data-testid="input-gravatar-email"
            />
          </label>
          <label className="label" htmlFor="">
            Nome
            <input
              className="input"
              type="text"
              value={ name }
              name="name"
              onChange={ this.handleChange }
              data-testid="input-player-name"
            />
          </label>
          <button
            className="button btn-play"
            type="submit"
            disabled={ !name || !email || loading }
            data-testid="btn-play"
          >
            {loading ? '...' : 'Play'}
          </button>
        </form>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect()(Login);
