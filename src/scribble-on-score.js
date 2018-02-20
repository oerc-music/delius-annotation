var SVGNS = "http://www.w3.org/2000/svg";
var chordAnnotationsSoFar = [{}];
var allAnnotations = [[]];
var theJoyOfX = [[],[],[],[]];
var staffGaps = [2000, 5500, 8300, 10800];
var SVG;
var SVGDefs;
var notes = false;
var annotationAppliesTo = {};
var stupidID = 0;
var paths = {
	pp: "M281 274c56 0 92 -31 92 -89c0 -95 -78 -195 -174 -195c-17 0 -30 2 -44 9c-16 8 -19 18 -24 18s-7 -7 -9 -12l-45 -112c-1 -3 -2 -6 -2 -7c0 -3 3 -3 9 -3h40c8 0 12 -4 12 -12c0 -9 -4 -13 -13 -13h-193c-8 0 -12 4 -12 12c0 9 4 13 13 13h31c10 0 12 2 15 10l123 305 c3 7 6 17 6 25c0 7 -3 12 -11 12c-18 0 -38 -26 -67 -76c-5 -9 -9 -15 -16 -15c-6 0 -11 4 -11 11c0 5 2 10 7 19c31 57 63 99 122 99c26 0 41 -9 48 -21c9 -17 6 -24 11 -24c4 0 7 8 21 20c18 16 40 26 71 26zM636 274c56 0 92 -31 92 -89c0 -95 -78 -195 -174 -195 c-17 0 -30 2 -44 9c-16 8 -19 18 -24 18s-7 -7 -9 -12l-45 -112c-1 -3 -2 -6 -2 -7c0 -3 3 -3 9 -3h40c8 0 12 -4 12 -12c0 -9 -4 -13 -13 -13h-193c-8 0 -12 4 -12 12c0 9 4 13 13 13h31c10 0 12 2 15 10l123 305c3 7 6 17 6 25c0 7 -3 12 -11 12c-15 0 -28 -17 -38 -30 c-2 -2 -4 -6 -4 -6c-5 -7 -9 -12 -16 -12c-6 0 -11 3 -11 10c0 5 2 10 8 19c22 31 48 57 96 57c26 0 41 -9 48 -21c9 -17 6 -24 11 -24c4 0 7 8 21 20c18 16 40 26 71 26zM254 237c-24 0 -50 -29 -64 -63l-20 -49c-11 -28 -19 -48 -19 -69s8 -32 25 -32 c48 0 101 127 101 176c0 22 -6 37 -23 37zM609 237c-24 0 -50 -29 -64 -63l-20 -49c-11 -28 -19 -48 -19 -69s8 -32 25 -32c48 0 101 127 101 176c0 22 -6 37 -23 37z",
	p: "M274 274c56 0 92 -31 92 -89c0 -95 -78 -195 -174 -195c-17 0 -30 2 -44 9c-16 8 -19 18 -24 18s-7 -7 -9 -12l-45 -112c-1 -3 -2 -6 -2 -7c0 -3 3 -3 9 -3h40c8 0 12 -4 12 -12c0 -9 -4 -13 -13 -13h-193c-8 0 -12 4 -12 12c0 9 4 13 13 13h31c10 0 12 2 15 10l123 305 c3 7 6 17 6 25c0 7 -3 12 -11 12c-18 0 -38 -26 -67 -76c-5 -9 -9 -15 -16 -15c-6 0 -11 4 -11 11c0 5 2 10 7 19c31 57 63 99 122 99c26 0 41 -9 48 -21c9 -17 6 -24 11 -24c4 0 7 8 21 20c18 16 40 26 71 26zM247 237c-24 0 -50 -29 -64 -63l-20 -49 c-11 -28 -19 -48 -19 -69s8 -32 25 -32c48 0 101 127 101 176c0 22 -6 37 -23 37z",
	mp: "M444 132l7 16c24 54 56 125 131 125c26 0 41 -9 48 -21c9 -17 6 -24 11 -24c4 0 7 8 21 20c18 16 40 26 71 26c56 0 92 -31 92 -89c0 -95 -78 -195 -174 -195c-17 0 -30 2 -44 9c-16 8 -19 18 -24 18s-7 -7 -9 -12l-45 -112c-1 -3 -2 -6 -2 -7c0 -3 3 -3 9 -3h40 c8 0 12 -4 12 -12c0 -9 -4 -13 -13 -13h-193c-8 0 -12 4 -12 12c0 9 4 13 13 13h31c10 0 12 2 15 10l123 305c3 7 6 17 6 25c0 7 -2 12 -10 12c-26 0 -52 -51 -82 -119c-31 -71 -71 -126 -134 -126c-29 0 -45 14 -45 40c0 42 62 145 62 180c0 8 -3 14 -15 14 c-22 0 -43 -21 -55 -50l-65 -162c-4 -10 -7 -12 -16 -12h-49c-8 0 -11 2 -11 6c0 3 1 6 3 11c62 155 63 155 63 156c6 14 10 25 10 37c0 8 -3 14 -15 14c-22 0 -43 -21 -55 -50l-65 -162c-4 -10 -7 -12 -16 -12h-49c-8 0 -11 2 -11 6c0 3 1 6 3 11l73 181c3 7 6 17 6 25 c0 7 -3 12 -11 12c-18 0 -38 -27 -68 -78c-5 -8 -8 -13 -15 -13c-6 0 -11 4 -11 11c0 5 2 10 7 19c31 56 62 99 115 99c19 0 33 -10 39 -23c6 -14 3 -21 8 -21c4 0 5 4 15 14c16 17 39 31 68 31c25 0 38 -11 44 -24s3 -21 8 -21c4 0 5 4 15 14c16 17 39 31 68 31 c41 0 54 -29 54 -54c0 -55 -58 -142 -58 -177c0 -6 2 -9 8 -9c20 0 45 37 73 98zM628 24c48 0 101 127 101 176c0 22 -6 37 -23 37c-24 0 -50 -29 -64 -63l-20 -49c-11 -28 -19 -48 -19 -69s8 -32 25 -32z",
	mf: "M367 274c41 0 54 -29 54 -54c0 -55 -58 -142 -58 -177c0 -6 2 -9 8 -9c13 0 32 24 51 54c5 8 8 13 15 13c5 0 9 -3 9 -9c0 -5 -3 -11 -9 -21c-32 -53 -67 -81 -105 -81c-29 0 -45 14 -45 40c0 42 62 145 62 180c0 8 -3 14 -15 14c-22 0 -43 -21 -55 -50l-65 -162 c-4 -10 -7 -12 -16 -12h-49c-8 0 -11 2 -11 6c0 3 1 6 3 11c62 155 63 155 63 156c6 14 10 25 10 37c0 8 -3 14 -15 14c-22 0 -43 -21 -55 -50l-65 -162c-4 -10 -7 -12 -16 -12h-49c-8 0 -11 2 -11 6c0 3 1 6 3 11l73 181c3 7 6 17 6 25c0 7 -3 12 -11 12 c-18 0 -38 -27 -68 -78c-5 -8 -8 -13 -15 -13c-6 0 -11 4 -11 11c0 5 2 10 7 19c31 56 62 99 115 99c19 0 33 -10 39 -23c6 -14 3 -21 8 -21c4 0 5 4 15 14c16 17 39 31 68 31c25 0 38 -11 44 -24s3 -21 8 -21c4 0 5 4 15 14c16 17 39 31 68 31zM470 251h58c14 0 15 0 20 15 c33 96 87 165 184 165c63 0 86 -30 86 -67s-23 -54 -49 -54c-25 0 -45 14 -45 42c0 18 8 32 21 38c11 5 16 4 16 10s-8 8 -16 8c-50 0 -72 -53 -92 -140c-1 -6 -2 -9 -2 -12c0 -5 3 -5 10 -5h60c10 0 15 -5 15 -15c0 -11 -5 -16 -16 -16h-65c-5 0 -13 -9 -13 -11 c0 -1 -1 -2 -1 -3c-24 -84 -46 -146 -75 -207c-55 -113 -102 -164 -178 -164c-42 0 -75 23 -75 67c0 31 22 55 52 55c27 0 45 -15 45 -41c0 -16 -8 -29 -20 -37c-15 -10 -24 -5 -24 -13c0 -5 5 -9 18 -9c40 0 58 32 86 130l63 219c1 5 2 8 2 10c0 4 -2 4 -8 4h-58 c-10 0 -15 5 -15 15c0 11 5 16 16 16z",
	f: "M16 264h58c14 0 15 0 20 15c33 96 87 165 184 165c63 0 86 -30 86 -67s-23 -54 -49 -54c-25 0 -45 14 -45 42c0 18 8 32 21 38c11 5 16 4 16 10s-8 8 -16 8c-50 0 -72 -53 -92 -140c-1 -6 -2 -9 -2 -12c0 -5 3 -5 10 -5h60c10 0 15 -5 15 -15c0 -11 -5 -16 -16 -16h-65 c-5 0 -13 -9 -13 -11c0 -1 -1 -2 -1 -3c-24 -84 -46 -146 -75 -207c-55 -113 -102 -164 -178 -164c-42 0 -75 23 -75 67c0 31 22 55 52 55c27 0 45 -15 45 -41c0 -16 -8 -29 -20 -37c-15 -10 -24 -5 -24 -13c0 -5 5 -9 18 -9c40 0 58 32 86 130l63 219c1 5 2 8 2 10 c0 4 -2 4 -8 4h-58c-10 0 -15 5 -15 15c0 11 5 16 16 16z",
	ff: "M213 264h107c14 0 15 0 20 15c33 96 87 165 184 165c63 0 86 -30 86 -67s-23 -54 -49 -54c-25 0 -45 14 -45 42c0 18 8 32 21 38c11 5 16 4 16 10s-8 8 -16 8c-50 0 -72 -53 -92 -140c-1 -6 -2 -9 -2 -12c0 -5 3 -5 10 -5h60c10 0 15 -5 15 -15c0 -11 -5 -16 -16 -16h-65 c-5 0 -13 -9 -13 -11c0 -1 -1 -2 -1 -3c-24 -84 -46 -146 -75 -207c-55 -113 -102 -164 -178 -164c-42 0 -72 23 -72 62c0 31 18 52 49 52c24 0 41 -15 41 -39c0 -16 -5 -27 -17 -35c-11 -7 -15 -9 -15 -13c0 -3 2 -5 10 -5c40 0 58 32 86 130l63 219c1 5 2 8 2 10 c0 4 -2 4 -8 4h-112c-5 0 -13 -9 -13 -11c0 -1 -1 -2 -1 -3c-24 -84 -46 -146 -75 -207c-55 -113 -102 -164 -178 -164c-42 0 -75 23 -75 67c0 31 22 55 52 55c27 0 45 -15 45 -41c0 -16 -8 -29 -20 -37c-15 -10 -24 -5 -24 -13c0 -5 5 -9 18 -9c40 0 58 32 86 130l63 219 c1 5 2 8 2 10c0 4 -2 4 -8 4h-58c-10 0 -15 5 -15 15c0 11 5 16 16 16h58c14 0 15 0 20 15c33 97 80 165 178 165c57 0 77 -29 77 -55c0 -33 -17 -51 -44 -51c-24 0 -42 12 -42 41c0 27 18 31 18 38c0 3 -3 4 -8 4c-39 0 -54 -53 -74 -140c-1 -6 -2 -9 -2 -12 c0 -5 3 -5 10 -5z",
	upbow: "M126 1c-10 0 -17 6 -19 14l-105 459c-1 2 -1 3 -1 5c0 7 6 14 14 16h4c8 0 15 -5 18 -13l88 -385l89 385c2 8 9 13 17 13h4c9 -2 14 -9 14 -17v-4l-106 -459c-2 -8 -9 -14 -17 -14z",
	downbow: "M26 318h260c14 0 26 -12 26 -26v-280c0 -7 -6 -12 -12 -12h-13c-7 0 -13 5 -13 12v164c0 11 -59 17 -118 17s-118 -6 -118 -17v-164c0 -7 -6 -12 -12 -12h-14c-6 0 -12 5 -12 12v280c0 14 12 26 26 26z"
}

function getNotes(parent, list){
  for(var i=0; i<parent.children.length; i++){
    if(parent.children[i].className.baseVal.split(" ").indexOf("note")>-1){
			list.push(parent.children[i]);
    } else if(parent.children[i].children.length){
      list = getNotes(parent.children[i], list);
    } 
  }
  return list;
}

function addNotePositions(parent, dict, barno, staffno, layerno){
  for(var i=0; i<parent.children.length; i++){
    if(parent.children[i].className.baseVal.split(" ").indexOf("note")>-1){
      var u = Array.from(parent.children[i].children).filter(n => n.nodeName==="use")[0];
			var isChord = parent.className.baseVal.split(" ").indexOf("chord")>-1;
			var chord = isChord ? parent.children : [parent.children[i]];
			var chordID = isChord ? parent.id : parent.children[i].id;
			if(theJoyOfX[staffno].indexOf(u.x.baseVal.value)===-1) {
				theJoyOfX[staffno].push(u.x.baseVal.value);
				theJoyOfX[staffno] = theJoyOfX[staffno].sort((x, y) => x-y);
			}
      dict[parent.children[i].id]={bar: barno, staff: staffno, layer: layerno,
																	 x: u.x.baseVal.value, chord: chord, chordID: chordID};
    } else if(parent.children[i].children.length){
      addNotePositions(parent.children[i], dict, barno, staffno, layerno);
    } 
  }
  return dict;
}

function getAllNotePositions(SVG){
	var system = SVG.getElementsByClassName('system')[0];
	var measures = Array.from(system.children).filter(n => n.className.baseVal==="measure");
	var symbols = {};
	for(var i=0; i<measures.length; i++){
		var staves = Array.from(measures[i].children).filter(n => n.className.baseVal==="staff");
		for(var st=0; st<staves.length; st++){
			var layers = Array.from(staves[st].children).filter(n => n.className.baseVal==="layer");
			for(var l=0; l<layers.length; l++){
				symbols = addNotePositions(layers[l], symbols, i, st, l);
			}
		}
	}
	return symbols;
}

export function leftOf(note1, note2){
	if(!SVG) getSVG(document.getElementById(note1));
	if(!notes) notes = getAllNotePositions(SVG);
	return notes[note1].x < notes[note2].x;
}
function chordsBetween(note1, note2){
	// For drawing purposes, chords are more important than individual
	// notes. This is a stupid method, but performance isn't a worry
	var noteRange = notesBetween(note1, note2);
	var chordRange = [];
	for(var i = 0; i<noteRange.length; i++){
		if(chordRange.indexOf(notes[noteRange[i].id].chordID)===-1){
			chordRange.push(notes[noteRange[i].id].chordID)
		}
	}
	return chordRange;
}

function notesBetween(note1, note2){
	if(!SVG) getSVG(element);
	if(!notes) notes = getAllNotePositions(SVG);
	var noteDetails1 = notes[note1];
	var noteDetails2 = notes[note2];
	if(noteDetails1.staff !== noteDetails2.staff){
		console.log("Notes not on same staff", note1, note2);
		return [];
	}
	if(noteDetails2.x < noteDetails1.x) {
		// Only detectable like this in single-system implementation
		var oldnote1 = note1;
		var oldnoteDetails1 = noteDetails1;
		note1 = note2;
		note2 = oldnote1;
		noteDetails1 = noteDetails2;
		noteDetails2 = oldnoteDetails1;
	}
	var system = SVG.getElementsByClassName('system')[0];
	var measures = Array.from(system.children).filter(n => n.className.baseVal==="measure");
	var noteList = [];
	for(var i=noteDetails1.bar; i<=noteDetails2.bar; i++){
		var staves = Array.from(measures[i].children).filter(n => n.className.baseVal==="staff");
		var staff = staves[noteDetails1.staff];
		noteList = getNotes(staff, noteList);
	}
	return noteList.filter(n => notes[n.id].x >= noteDetails1.x && notes[n.id].x<=noteDetails2.x);
}
function chordForNote(elementId){
	if(!SVG) getSVG(document.getElementById(note1));
	if(!notes) notes = getAllNotePositions(SVG);
	notes[elementId].chord;
}
function makeSymbol(symbol, id){
	// Has pretty gnarly side effects. Returns the 'use' element, but
	// creates the symbol in the <defs> section of SVG. There probably
	// is a better way. N.B. Here, we're creating a new symbol
	// definition for every annotation, which is also fairly stupid.
	var symbolEl = document.createElementNS(SVGNS, "symbol");
  symbolEl.setAttributeNS(null, "viewBox", "0 0 1000 1000");
  symbolEl.setAttributeNS(null, "overflow", "inherit");
  symbolEl.setAttributeNS(null, "id", id);
	var path=document.createElementNS(SVGNS, "path");
	path.setAttributeNS(null, "transform", "scale(1,-1)");
	path.setAttributeNS(null, "d", paths[symbol]);
	symbolEl.appendChild(path);
	if(!SVG){
		console.log("makeSymbol needs SVG");
		return false;
	}
	if(!SVGDefs) getSVGDefs(SVG);
	SVGDefs.appendChild(symbolEl);
	var useEl= document.createElementNS(SVGNS, "use");
	useEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#"+id);
	return useEl;
}

function getSVG(element){
	// N.B. In Verovio, this is an SVG in an SVG!
	while(element.parentNode && element.parentNode.nodeName.toLowerCase()!=="svg"){
		element = element.parentNode;
	}
	if(element.parentNode){
		SVG = element.parentNode;
		return SVG;
	} else {
		console.log("Looking for SVG for element that is not a child of one", element);
	}
}
function getSVGDefs(SVG){
	// N.B. In Verovio, we this is in the parent SVG, not the Child
	var mainSVG = SVG;
	var mySVG = getSVG(SVG);
	SVG = mainSVG;
	var topLevel = mySVG.childNodes;
	for(var i=0; i<topLevel.length; i++){
		if(topLevel[i].nodeName.toLowerCase()==="defs"){
			SVGDefs = topLevel[i];
			return SVGDefs;
		} 
	}
	// No Defs section (highly unlikely). Create one.
	console.log("really? No defs in SVG?!?", SVG);
	SVGDefs = document.createElementNS(SVGNS, "defs");
	// FIXME: Probably should be [1], or at least a check for correct position,
	// but with Verovio, this is a near-impossible edge case anyway.
	SVG.insertBefore(SVGDefs, topLevel[0]);
	return SVGDefs;
}

export function drawRangedThingOnScore(element1, nudge1, element2, nudge2, symbol, annotationSet, id) {
	if(!SVG) getSVG(element1);
	if(!notes) notes = getAllNotePositions(SVG);
	if(!annotationSet) annotationSet=0
	// if(element1===element2) {
	// 	if(symbol="") console.log("Nonsense ranged symbol", element1, element2);
	// 	nudge1=false;
	// 	nudge2=true;
	// }
	if(notes[element1.id].x > notes[element2.id].x){
		// swap 'em
		var temp = element1;
		element1 = element2;
		element2 = temp;
		temp = nudge1;
		nudge1 = nudge2;
		nudge2 = temp;
	}
	var note1 = notes[element1.id];
	var note2 = notes[element2.id];
	var noteset = notesBetween(element1.id, element2.id);
	var staffNo = note1.staff;
	var y = staffGaps[staffNo];
	var yNudge = 0;
	while(chordAnnotationsSoFar.length<=annotationSet) {
		chordAnnotationsSoFar.push({});
	}
	var chordSet = chordsBetween(element1.id, element2.id);
	var adjustNo = 0;
	for(var i=0; i<chordSet.length; i++){
		if(chordAnnotationsSoFar[annotationSet][chordSet[i]]){
			adjustNo = Math.max(adjustNo, chordAnnotationsSoFar[annotationSet][chordSet[i]].length);
			chordAnnotationsSoFar[annotationSet][chordSet[i]].push(symbol);
		} else {
			chordAnnotationsSoFar[annotationSet][chordSet[i]] = [symbol];
		}
	}
	var yBase = y-(adjustNo*550);
	while(allAnnotations.length<=annotationSet) {
		allAnnotations.push([]);
	}
	allAnnotations[annotationSet][id] = {symbol: symbol,
																				elements: [element1, element2],
																				nudges: [nudge1, nudge2],
																				y: yBase };
	if(id){
		annotationAppliesTo[id]={elements: [element1, element2], nudges: [nudge1, nudge2],
														 symbol: symbol, set: annotationSet};
	}
	drawRangedSymbol(element1, nudge1, element2, nudge2, symbol, annotationSet, id, yBase);
}

function drawRangedSymbol(element1, nudge1, element2, nudge2, symbol, annotationSet, id, yBase){
	var xFudge = 540
	var note1 = notes[element1.id];
	var note2 = notes[element2.id];
	var group = document.createElementNS(SVGNS, "g");
	if(id) {
		group.setAttributeNS(null, "id", id);
	}
	var deltax1 = 0;
	var deltax2 = 0;
	if(nudge1){
		var pos1 = theJoyOfX[note1.staff].indexOf(note1.x);
		if(pos1>-1 && pos1< theJoyOfX[note1.staff].length-1){
			deltax1 = (theJoyOfX[note1.staff][pos1+1] - note1.x) / 3;
		} else if (pos1>-1) {
			deltax1 = 360;
		} else {
			console.log("Something is wrong with nudge locations:",
									theJoyOfX[note1.staff], note1.x, pos1);
			deltax1 = 240;
		}
	}
	if(nudge2){
		var pos2 = theJoyOfX[note2.staff].indexOf(note2.x);
		if(pos2>-1 && pos2< theJoyOfX[note2.staff].length-1){
			deltax2 = 3 * (theJoyOfX[note2.staff][pos2+1] - note2.x) / 5;
		} else if (pos2>-1) {
			deltax2 = 1080;
		} else {
			console.log("Something is wrong with nudge locations:",
									theJoyOfX[note1.staff], note1.x, pos1);
			deltax2 = 360;
		}
	}
  group.setAttributeNS(null, "class", symbol + " annotation set"+annotationSet);
	var left = xFudge + note1.x + deltax1;
	var right = xFudge + note2.x + deltax2;
	var yTop = yBase - 300;
	var yMid = yBase - 170;
	if(left==right) right+=200;
	switch(symbol) {
		case "cresc":
			var topBit = document.createElementNS(SVGNS, "polygon");
			topBit.setAttributeNS(null, "points", left+","+(yMid-20)+" "+
																right+","+(yTop-40)+" "+
																right+","+yTop+" "+
																left+","+(yMid+20));
			var bottomBit = document.createElementNS(SVGNS, "polygon");
			bottomBit.setAttributeNS(null, "points", left+","+(yMid-20)+" "+
																right+","+(yBase-40)+" "+
																right+","+yBase+" "+
																left+","+(yMid+20));
			group.appendChild(topBit);
			group.appendChild(bottomBit);
			break;
		case "dim":
			var topBit = document.createElementNS(SVGNS, "polygon");
			topBit.setAttributeNS(null, "points", right+","+(yMid-20)+" "+
																left+","+(yTop-40)+" "+
																left+","+yTop+" "+
																right+","+(yMid+20));
			var bottomBit = document.createElementNS(SVGNS, "polygon");
			bottomBit.setAttributeNS(null, "points", right+","+(yMid-20)+" "+
																left+","+(yBase-40)+" "+
																left+","+yBase+" "+
																right+","+(yMid+20));
			group.appendChild(topBit);
			group.appendChild(bottomBit);
			break;
		case "phrase":
			var path = document.createElementNS(SVGNS, "path");
			path.setAttributeNS(null, "d", "M"+left+","+yBase+
													" C"+(left+100)+","+(yTop-150)+
													" "+(right-100)+","+(yTop-150)+" "
													+right+","+yBase+
													" C"+(right-100)+","+(yTop-50)+
													" "+(left+100)+","+(yTop-50)+
													" "+left+","+yBase);
			group.appendChild(path);
	}
	SVG.appendChild(group);
}
		
export function drawSingleThingOnScore(element, symbol, xnudge, annotationSet, id) {
	// Records presence of the annotation and draws it
	if(symbol==="cresc" || symbol==="dim"){
		// This looks like a point annotation, but is really a range
		console.log("Single-note ranged thing");
		return drawRangedThingOnScore(element, xnudge, element, true, symbol, annotationSet, id);
	}
	if(!SVG) getSVG(element);
	if(!notes) {
		notes = getAllNotePositions(SVG);
	}
	if(!annotationSet) annotationSet=0;
	var staffNo = notes[element.id].staff;
	var y = staffGaps[staffNo];
	var yNudge = 0;
	while(chordAnnotationsSoFar.length<=annotationSet) {
		chordAnnotationsSoFar.push({});
	}
	if(chordAnnotationsSoFar[annotationSet][notes[element.id].chordID]){
		yNudge = -550 * chordAnnotationsSoFar[annotationSet][notes[element.id].chordID].length;
		console.log(chordAnnotationsSoFar[annotationSet][notes[element.id].chordID].length);
		chordAnnotationsSoFar[annotationSet][notes[element.id].chordID].push(symbol);
	} else {
		chordAnnotationsSoFar[annotationSet][notes[element.id].chordID] = [symbol];
	}
	while(allAnnotations.length<=annotationSet) {
		allAnnotations.push([]);
	}
	allAnnotations[annotationSet][id] = {symbol:symbol, elements: [element], nudges:[xnudge],
																			 y:y+yNudge};
	if(id){
		annotationAppliesTo[id]={elements: [element], nudges: [xnudge],
														 symbol: symbol, set: annotationSet};
	}
	drawSymbol(element, symbol, xnudge, annotationSet, id, y+yNudge);
}

function drawSymbol(element, symbol, xnudge, annotationSet, id, y){
	var group = document.createElementNS(SVGNS, "g");
	if(id) {
		group.setAttributeNS(null, "id", id);
	}
	var deltax = 360;
	if(xnudge){
		var elid = element.id
		var eln = notes[elid];
		var staffxxx = theJoyOfX[eln.staff];
		var staffn = staffxxx.indexOf(eln.x);
		if(staffn>-1 && staffn < staffxxx.length-1){
			deltax += (staffxxx[staffn+1] - eln.x) / 2;
		} else {
			deltax += 360;
		}
	}
  group.setAttributeNS(null, "class", symbol + " annotation set"+annotationSet);
	if(paths[symbol]) {
		// this is a symbol
		var useEl = makeSymbol(symbol, "ID"+stupidID++);
		var bowingHack = symbol.indexOf("bow") > -1 ? 120 : 0;
		useEl.setAttributeNS(null, "x", notes[element.id].x+deltax + bowingHack);
		useEl.setAttributeNS(null, "y", y);
		useEl.setAttributeNS(null, "width", "720px");
		useEl.setAttributeNS(null, "height", "720px");
		group.appendChild(useEl);
	} else {
		// this is fingering
		var textEl = document.createElementNS(SVGNS, "text"); 
		textEl.setAttributeNS(null, "x", notes[element.id].x+deltax + 120);
		textEl.setAttributeNS(null, "y", y);
		textEl.setAttributeNS(null, "class", "fingering");
		var span = document.createElementNS(SVGNS, "tspan");
		//span.setAttributeNS(null, "text-anchor", "middle");
		span.setAttributeNS(null, "text-anchor", "left");
		var textNode = document.createTextNode(symbol[symbol.length-1]);
		span.appendChild(textNode);
		textEl.appendChild(span);
		group.appendChild(textEl);
	}
	// FIXME:!!!
	getSVG(element);
	SVG.appendChild(group);
}

export function showSet(setno){
	var annotations = document.getElementsByClassName('annotation');
	for(var a=0; a<annotations.length; a++){
		var classString = annotations[a].getAttribute('class')
		var classes = classString.split(/\s+/);
		if(classes.indexOf("set"+setno)>-1){
			annotations[a].setAttribute('class', classes.filter(cn => cn!=="cached").join(" "));
		} else if(classes.indexOf("cached")===-1){
			annotations[a].setAttribute('class', classString+" cached");
		} 
	}
}

export function deleteThis(elementID){
	//
	// delete it
	var element = document.getElementById(elementID);
	element.parentNode.removeChild(element);
	for(var i=0; i<allAnnotations.length; i++){
		if(allAnnotations[i][elementID]) {
			allAnnotations[i][elementID].deleted = true;
			return;
		}
	}
}

export function retractThis(elementID){
	//
	// Do semantic stuff
	//
	// 
	var element = document.getElementById(elementID);
	element.setAttribute('class', element.getAttribute('class')+' retracted');
	for(var i=0; i<allAnnotations.length; i++){
		if(allAnnotations[i][elementID]) {
			allAnnotations[i][elementID].retracted = true;
			return;
		}
	}
}

export function toggleNudgeAnnotationGlyphStart(elementID){
	for(var i=0; i<allAnnotations.length; i++){
		if(allAnnotations[i][elementID]) {
			var thisAnnotation = allAnnotations[i][elementID];
			// 1. modify in allAnnotations
			thisAnnotation.nudges[0] = !thisAnnotation.nudges[0];
			// 2. Delete the symbol
			var el = document.getElementById(elementID)
			el.parentNode.removeChild(el);
			// 3. redraw
			if(thisAnnotation.elements.length>1){
				drawRangedSymbol(thisAnnotation.elements[0], thisAnnotation.nudges[0],
												 thisAnnotation.elements[1], thisAnnotation.nudges[1],
												 thisAnnotation.symbol, i, elementID, thisAnnotation.y);
			} else {
				drawSymbol(thisAnnotation.elements[0], thisAnnotation.symbol,
									 thisAnnotation.nudges[0], i, elementID, thisAnnotation.y);
			}
		}
	}	
}

export function toggleNudgeAnnotationGlyphEnd(elementID){
	for(var i=0; i<allAnnotations.length; i++){
		if(allAnnotations[i][elementID]) {
			var thisAnnotation = allAnnotations[i][elementID];
			if(thisAnnotation.elements.length>1){
				// 1. modify in allAnnotations
				thisAnnotation.nudges[1] = !thisAnnotation.nudges[1];
				// 2. Delete the symbol
				var el = document.getElementById(elementID)
				el.parentNode.removeChild(el);
				// 3. redraw
				drawRangedSymbol(thisAnnotation.elements[0], thisAnnotation.nudges[0],
												 thisAnnotation.elements[1], thisAnnotation.nudges[1],
												 thisAnnotation.symbol, i, elementID, thisAnnotation.y);
				return
			} else {
				// error
				console.log("well, this doesn't make sense", elementID);
			}
		}
	}	
}
