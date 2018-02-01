import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import Modal from 'meld-client/src/containers/modalUI';
import { fetchGraph } from '../../../meld-client/src/actions/index';
import { setMode, clearConstituents, elementClicked } from '../../../meld-client/src/actions/modalUI';
import { decorateNotes } from '../actions/deliusActions';
import { modes } from '../../config/deliusModes';

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			modes: modes
		 };
	}
	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
		}
		
		this.props.decorateNotes(this.scoreElement)
	}
	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("dynamics")) {
			// user has selected dynamics - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("dynamicsMode");
		}
	}

	render() { 
		console.log("My props: ", this.props);
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
					<Score uri="http://meld.linkedmusic.org/mei/Late_Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreElement = score}} />
			</div>
		)
	}
}

function mapStateToProps({ modalUI }) {
	return { modalUI }
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ setMode, clearConstituents, decorateNotes }, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
