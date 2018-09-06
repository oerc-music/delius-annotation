import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { Router, Route, browserHistory } from 'react-router'

import { reducers } from 'meld-clients-core/src/reducers';
import App from './containers/app';
import Playback from './containers/playback';

const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

// ***** CHANGE ME TO DELIUS SERVER IP *******//
//const baseUri = "http://192.168.0.180:5000"
const baseUri = "http://127.0.0.1:6000"
// *******************************************//

ReactDOM.render(
	<Provider store={createStoreWithMiddleware(reducers)}>
		<Router history={browserHistory}> 
			<Route path="/" component={App} baseUri = {baseUri} />
			<Route path="/playback" component={Playback} baseUri={baseUri} graphUri="/delius-REANNOTATION-test.jsonld" />
		</Router>
	</Provider>
		, document.querySelector('.container'));
