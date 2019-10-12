import axios from 'axios';

const setAuthToken = token => {
	if (token) {
		// set the headers to the token passed in
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		delete axios.defaults.headers.common['x-auth-token'];
	}
};

export default setAuthToken;
