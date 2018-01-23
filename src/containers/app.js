import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import { fetchGraph } from 'meld-client/src/actions/index';

const MEIManifestation = "meldterm:MEIManifestation";

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { currentMotif: this.props.motif || false };
	}
	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
		}
	}
	render() { 
		return (<div> Loading...  </div>);
	}
}
