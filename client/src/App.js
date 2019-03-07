import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import './App.css'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'

import Register from './components/auth/Register'
import Login from './components/auth/Login'

class App extends Component {
	render() {
		return (
			<div>
				<Navbar />
				<Switch>
					<Route exact path="/" component={Landing} />
					<div className="container">
						<Route exact path="/register" component={Register} />
						<Route exact path="/login" component={Login} />
					</div>
				</Switch>
				<Footer />
			</div>
		)
	}
}

export default App
