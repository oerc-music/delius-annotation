import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import Modal from 'meld-client/src/containers/modalUI';
import { fetchGraph } from '../../../meld-client/src/actions/index';
import { setMode, clearConstituents, elementClicked } from '../../../meld-client/src/actions/modalUI';
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
		console.log("I've found these notes: ",document.querySelectorAll('.note'));
	}
	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("dynamics")) {
			// user has selected dynamics - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("dynamicsMode");
		} else if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("bowing")) {
			// user has selected bowings - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("bowingMode");
		} else if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("phrasing")) {
			// user has selected bowings - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("phrasingMode");
		} else if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("hairpins")) {
			// user has selected bowings - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("hairpinMode");
		} else if (this.props.modalUI.mode == "baseMode" && nextProps.modalUI.constituents.has("fingerings")) {
			// user has selected bowings - clear selections, and switch modes
			this.props.clearConstituents();
			this.props.setMode("fingeringsMode");
		}
	}

	render() {
		//uri="http://meld.linkedmusic.org/mei/Late_Swallows-dolet-musescore-II.mei" 
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
				<Score uri="/Late Swallows-dolet-musescore-II.mei" 
						onClick={(e) =>  this.handleScoreClick(e) } ref="score" />
			</div>
		)
	}
	
	handleScoreClick(e) { 
		console.log("score clicked: ", e);
	}
}

function mapStateToProps({ modalUI }) {
	return { modalUI }
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ setMode, clearConstituents }, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
