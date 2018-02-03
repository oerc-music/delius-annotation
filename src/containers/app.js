import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import Modal from 'meld-client/src/containers/modalUI';
import { fetchGraph } from '../../../meld-client/src/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from '../../../meld-client/src/actions/modalUI';
import { attachClickHandlerToNotes, decorateNotes } from '../actions/deliusActions';
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
		this.props.attachClickHandlerToNotes(this.scoreComponent, this.props.modalUI.elements)
	}
	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		// RULES
		// 1. If more than 2 note elements selected, throw out the oldest element
		// 		(only makes sense to have up to 2 selected for Delius annotation)
		if(nextProps.modalUI.elements.length > 2) { 
			this.props.popElements();
		}
		// 2. If dynamics is clicked in baseMode, switch to dynamicsMode
		if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("dynamics")) {
			// user has selected dynamics - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("dynamicsMode");
		}

	}

	componentDidUpdate(nextProps) { 
		// update note classes (ensure only selected ones are highlighted)
		this.props.decorateNotes(this.scoreComponent, this.props.modalUI.elements);
		console.log("modalUI elements", this.props.modalUI.elements); 
	}

	render() { 
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
					<Score uri="http://meld.linkedmusic.org/mei/Late_Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreComponent = score}} />
			</div>
		)
	}
}

function mapStateToProps({ modalUI }) {
	return { modalUI }
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ 
		attachClickHandlerToNotes,
		clearConstituents, 
		clearElements,
		decorateNotes,
		popElements,
		setMode 
	}, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
