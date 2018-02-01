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
		//console.log("I've found this score element: ", ReactDOM.findDOMNode(this.scoreElement));
		
		this.props.decorateNotes(this.scoreElement)

//		// give each note in the score SVG a clickhandler:
//		const notes = ReactDOM.findDOMNode(this.scoreElement).querySelectorAll(".note");
//		console.log("Found notes: ", notes);
//		console.log("Found score element: ", ReactDOM.findDOMNode(this.scoreElement).innerHTML)
//		Array.prototype.map.call(notes, function(n) { console.log(n); n.style.fill = "red"; })

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
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
					<Score uri="http://meld.linkedmusic.org/mei/Late_Swallows-dolet-musescore-II.mei" 
						onClick={(e) =>  this.handleScoreClick(e) } ref={(score) => {this.scoreElement = score}} />
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
	return bindActionCreators({ setMode, clearConstituents, decorateNotes }, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
