import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
//import { Router, Route, browserHistory } from 'react-router'
import { Switch, Router, Route } from 'react-router'

import { reducers } from 'meld-clients-core/lib/reducers';
import App from './containers/app';
import Playback from './containers/playback';
import { createBrowserHistory } from "history";

const history = createBrowserHistory();
const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

// ***** CHANGE ME TO DELIUS SERVER IP *******//
//const baseUri = "http://192.168.0.180:5000"
const baseUri = "http://127.0.0.1:6000"
const graphUri="/delius-shorter.jsonld";
// *******************************************//

ReactDOM.render(
	<Provider store={createStoreWithMiddleware(reducers)}>
		<Router history={history}>
			<Switch>
  			<Route path="/playback">
					<Playback
						baseUri={baseUri} graphUri={graphUri} />
				</Route>
				<Route path="/">
					<App baseUri={baseUri} />
				</Route>
			</Switch>
		</Router>
	</Provider>
		, document.querySelector('.container'));
