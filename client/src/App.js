import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Routes from './components/routing/Routes';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/auth';
// Redux-- NB: Provider connects redux to react
import { Provider } from 'react-redux';
import store from './store';

import './App.css';

// Run every time the user loads
if (localStorage.token) {
	setAuthToken(localStorage.token);
}

const App = () => {
	// the [] makes it run only once
	useEffect(() => {
		store.dispatch(loadUser());
	}, []);
	return (
		<Provider store={store}>
			<Router>
				<Fragment>
					<Navbar />
					<Switch>
						<Route exact path='/' component={Landing} />
						<Route component={Routes} />
					</Switch>
				</Fragment>
			</Router>
		</Provider>
	);
};

export default App;
