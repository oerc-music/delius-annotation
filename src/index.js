import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { Router, Route, browserHistory } from 'react-router'

import reducers from '../../meld-client/src/reducers';
import App from './containers/app';

const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

// ***** CHANGE ME TO DELIUS SERVER IP *******//
//const baseUri = "http://192.168.0.180:5000"
const baseUri = "http://127.0.0.1:5000"
// *******************************************//

ReactDOM.render(
	<Provider store={createStoreWithMiddleware(reducers)}>
		<Router history={browserHistory}> 
			<Route path="/" component={App} baseUri = {baseUri} />
		</Router>
	</Provider>
		, document.querySelector('.container'));
