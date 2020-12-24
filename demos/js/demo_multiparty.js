

var activeBox = -1;  // nothing selected
var aspectRatio = 4/3;  // standard definition video aspect ratio
var maxCALLERS = 3;
var numVideoOBJS = maxCALLERS+1;
var layout;


easyrtc.dontAddCloseButtons(true);

function getIdOfBox(boxNum) {
    return "box" + boxNum;
}


function reshapeFull(parentw, parenth) {
    return {
        left:0,
        top:0,
        width:parentw,
        height:parenth
    };
}

function reshapeTextEntryBox(parentw, parenth) {
    return {
        left:parentw/4,
        top:parenth/4,
        width:parentw/2,
        height: parenth/4
    }
}

function reshapeTextEntryField(parentw, parenth) {
    return {
        width:parentw -40
    }
}

var margin = 20;

function reshapeToFullSize(parentw, parenth) {
    var left, top, width, height;
    var margin= 20;

    if( parentw < parenth*aspectRatio){
        width = parentw -margin;
        height = width/aspectRatio;
    }
    else {
        height = parenth-margin;
        width = height*aspectRatio;
    }
    left = (parentw - width)/2;
    top = (parenth - height)/2;
    return {
        left:left,
        top:top,
        width:width,
        height:height
    };
}

//
// a negative percentLeft is interpreted as setting the right edge of the object
// that distance from the right edge of the parent.
// Similar for percentTop.
//
function setThumbSizeAspect(percentSize, percentLeft, percentTop, parentw, parenth, aspect) {

    var width, height;
    if( parentw < parenth*aspectRatio){
        width = parentw * percentSize;
        height = width/aspect;
    }
    else {
        height = parenth * percentSize;
        width = height*aspect;
    }
    var left;
    if( percentLeft < 0) {
        left = parentw - width;
    }
    else {
        left = 0;
    }
    left += Math.floor(percentLeft*parentw);
    var top = 0;
    if( percentTop < 0) {
        top = parenth - height;
    }
    else {
        top = 0;
    }
    top += Math.floor(percentTop*parenth);
    return {
        left:left,
        top:top,
        width:560,
        height:320
    };
}


function setThumbSizeButton(percentSize, percentLeft, percentTop, parentw, parenth, imagew, imageh) {
    return setThumbSizeAspect(percentSize, percentLeft, percentTop, parentw, parenth, imagew/imageh);
}


var sharedVideoWidth  = 1;
var sharedVideoHeight = 1;
var boxUsed = [true, false, false, false];
var connectCount = 0;


function killButtonReshaper(parentw, parenth) {
    var imagew = 128;
    var imageh = 128;
    if( parentw < parenth) {
        return setThumbSizeButton(0.1, -0.51, -0.01, parentw, parenth, imagew, imageh);
    }
    else {
        return setThumbSizeButton(0.1, -0.01, -0.51, parentw, parenth, imagew, imageh);
    }
}


function muteButtonReshaper(parentw, parenth) {
    var imagew = 32;
    var imageh = 32;
    if( parentw < parenth) {
        return setThumbSizeButton(0.10, -0.51, 0.01, parentw, parenth, imagew, imageh);
    }
    else {
        return setThumbSizeButton(0.10, 0.01, -0.51, parentw, parenth, imagew, imageh);
    }
}

function reshapeTextEntryButton(parentw, parenth) {
    var imagew = 32;
    var imageh = 32;
    if( parentw < parenth) {
        return setThumbSizeButton(0.10, 0.51, 0.01, parentw, parenth, imagew, imageh);
    }
    else {
        return setThumbSizeButton(0.10, 0.01, 0.51, parentw, parenth, imagew, imageh);
    }
}


function handleWindowResize() {
    var fullpage = document.getElementById('fullpage');
    fullpage.style.width = window.innerWidth + "px";
    fullpage.style.height = window.innerHeight + "px";
    connectCount = easyrtc.getConnectionCount();
}


function setReshaper(elementId, reshapeFn) {
    var element = document.getElementById(elementId);
    if( !element) {
        alert("Attempt to apply to reshapeFn to non-existent element " + elementId);
    }
    if( !reshapeFn) {
        alert("Attempt to apply misnamed reshapeFn to element " + elementId);
    }
    element.reshapeMe = reshapeFn;
}


function collapseToThumbHelper() {
    if( activeBox >= 0) {
        var id = getIdOfBox(activeBox);
        document.getElementById(id).style.zIndex = 2;
        document.getElementById('muteButton').style.display = "none";
        document.getElementById('killButton').style.display = "none";
        activeBox = -1;
    }
}

function collapseToThumb() {
    collapseToThumbHelper();
    activeBox = -1;
    updateMuteImage(false);
    handleWindowResize();

}

function updateMuteImage(toggle) {
    var muteButton = document.getElementById('muteButton');
    if( activeBox > 0) { // no kill button for self video
        muteButton.style.display = "block";
        var videoObject = document.getElementById( getIdOfBox(activeBox));
        var isMuted = videoObject.muted?true:false;
        if( toggle) {
            isMuted = !isMuted;
            videoObject.muted = isMuted;
        }
        muteButton.src = isMuted?"images/button_unmute.png":"images/button_mute.png";
    }
    else {
        muteButton.style.display = "none";
    }
}


function expandThumb(whichBox) {
    var lastActiveBox = activeBox;
    if( activeBox >= 0 ) {
        collapseToThumbHelper();
    }
    if( lastActiveBox != whichBox) {
        var id = getIdOfBox(whichBox);
        activeBox = whichBox;
        setReshaper(id, reshapeToFullSize);
        document.getElementById(id).style.zIndex = 1;
        if( whichBox > 0) {
            document.getElementById('muteButton').style.display = "block";
            updateMuteImage();
            document.getElementById('killButton').style.display = "block";
        }
    }
    updateMuteImage(false);
    handleWindowResize();
}

function prepVideoBox(whichBox) {
    var id = getIdOfBox(whichBox);
    document.getElementById(id).onclick = function() {
        expandThumb(whichBox);
    };
}


function killActiveBox() {
    if( activeBox > 0) {
        var easyrtcid = easyrtc.getIthCaller(activeBox-1);
        collapseToThumb();
        setTimeout( function() {
            easyrtc.hangup(easyrtcid);
        }, 400);
    }
}


function muteActiveBox() {
    updateMuteImage(true);
}




function callEverybodyElse(roomName, otherPeople) {

    easyrtc.setRoomOccupantListener(null); // so we're only called once.

    var list = [];
    var connectCount = 0;
    for(var easyrtcid in otherPeople ) {
        list.push(easyrtcid);
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
        function callSuccess() {
            connectCount++;
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        function callFailure(errorCode, errorText) {
            easyrtc.showError(errorCode, errorText);
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        easyrtc.call(list[position], callSuccess, callFailure);

    }
    if( list.length > 0) {
        establishConnection(list.length-1);
    }
}


function loginSuccess() {
    expandThumb(0);  // expand the mirror image initially.
}


function cancelText() {
    document.getElementById('textentryBox').style.display = "none";
    document.getElementById('textEntryButton').style.display = "block";
}


function sendText(e) {
    document.getElementById('textentryBox').style.display = "none";
    document.getElementById('textEntryButton').style.display = "block";
    var stringToSend = document.getElementById('textentryField').value;
    if( stringToSend && stringToSend != "") {
        for(var i = 0; i < maxCALLERS; i++ ) {
            var easyrtcid = easyrtc.getIthCaller(i);
            if( easyrtcid && easyrtcid != "") {
                easyrtc.sendPeerMessage(easyrtcid, "im",  stringToSend);
            }
        }
    }
    return false;
}


function showTextEntry() {
    document.getElementById('textentryField').value = "";
    document.getElementById('textentryBox').style.display = "block";
    document.getElementById('textEntryButton').style.display = "none";
    document.getElementById('textentryField').focus();
}


function showMessage(startX, startY, content) {
    var fullPage = document.getElementById('fullpage');
    var fullW = parseInt(fullPage.offsetWidth);
    var fullH = parseInt(fullPage.offsetHeight);
    var centerEndX = 0.2*startX + 0.8*fullW/2;
    var centerEndY = 0.2*startY + 0.8*fullH/2;


    var cloudObject = document.createElement("img");
    cloudObject.src = "images/cloud.png";
    cloudObject.style.width = "1px";
    cloudObject.style.height = "1px";
    cloudObject.style.left = startX + "px";
    cloudObject.style.top = startY + "px";
    fullPage.appendChild(cloudObject);

    cloudObject.onload = function() {
        cloudObject.style.left = startX + "px";
        cloudObject.style.top = startY + "px";
        cloudObject.style.width = "4px";
        cloudObject.style.height = "4px";
        cloudObject.style.opacity = 0.7;
        cloudObject.style.zIndex = 5;
        cloudObject.className = "transit boxCommon";
        var textObject;
        function removeCloud() {
            if( textObject) {
                fullPage.removeChild(textObject);
                fullPage.removeChild(cloudObject);
            }
        }
        setTimeout(function() {
            cloudObject.style.left = centerEndX - fullW/4 + "px";
            cloudObject.style.top = centerEndY - fullH/4+ "px";
            cloudObject.style.width = (fullW/2) + "px";
            cloudObject.style.height = (fullH/2) + "px";
        }, 10);
        setTimeout(function() {
            textObject = document.createElement('div');
            textObject.className = "boxCommon";
            textObject.style.left = Math.floor(centerEndX-fullW/8) + "px";
            textObject.style.top = Math.floor(centerEndY) + "px";
            textObject.style.fontSize = "36pt";
            textObject.style.width = (fullW*0.4) + "px";
            textObject.style.height = (fullH*0.4) + "px";
            textObject.style.zIndex = 6;
            textObject.appendChild( document.createTextNode(content));
            fullPage.appendChild(textObject);
            textObject.onclick = removeCloud;
            cloudObject.onclick = removeCloud;
        }, 1000);
        setTimeout(function() {
            cloudObject.style.left = startX + "px";
            cloudObject.style.top = startY + "px";
            cloudObject.style.width = "4px";
            cloudObject.style.height = "4px";
            fullPage.removeChild(textObject);
        }, 9000);
        setTimeout(function(){
            fullPage.removeChild(cloudObject);
        }, 10000);
    }
}

function messageListener(easyrtcid, msgType, content) {
    for(var i = 0; i < maxCALLERS; i++) {
        if( easyrtc.getIthCaller(i) == easyrtcid) {
            var startArea = document.getElementById(getIdOfBox(i+1));
            var startX = parseInt(startArea.offsetLeft) + parseInt(startArea.offsetWidth)/2;
            var startY = parseInt(startArea.offsetTop) + parseInt(startArea.offsetHeight)/2;
            showMessage(startX, startY, content);
        }
    }
}


function appInit(roomName) {

    // Prep for the top-down layout manager
    setReshaper('fullpage', reshapeFull);
    for(var i = 0; i < numVideoOBJS; i++) {
        prepVideoBox(i);
    }
    setReshaper('killButton', killButtonReshaper);
    setReshaper('muteButton', muteButtonReshaper);
    setReshaper('textentryBox', reshapeTextEntryBox);
    setReshaper('textentryField', reshapeTextEntryField);
    setReshaper('textEntryButton', reshapeTextEntryButton);

    updateMuteImage(false);
    window.onresize = handleWindowResize;
    handleWindowResize(); //initial call of the top-down layout manager

    easyrtc.joinRoom(roomName, null)
    easyrtc.setRoomOccupantListener(callEverybodyElse);
    easyrtc.easyApp("easyrtc.multiparty", "box0", ["box1", "box2", "box3"], loginSuccess);
    easyrtc.setPeerListener(messageListener);
    easyrtc.setDisconnectListener( function() {
        easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
    });
    easyrtc.setOnCall( function(easyrtcid, slot) {
        console.log("getConnection count="  + easyrtc.getConnectionCount() );
        boxUsed[slot+1] = true;
        if(activeBox == 0 ) { // first connection
            collapseToThumb();
            document.getElementById('textEntryButton').style.display = 'block';
        }
        document.getElementById(getIdOfBox(slot+1)).style.visibility = "visible";
        handleWindowResize();
    });


    easyrtc.setOnHangup(function(easyrtcid, slot) {
        boxUsed[slot+1] = false;
        if(activeBox > 0 && slot+1 == activeBox) {
            collapseToThumb();
        }
        setTimeout(function() {
            document.getElementById(getIdOfBox(slot+1)).style.visibility = "hidden";

            if( easyrtc.getConnectionCount() == 0 ) { // no more connections
                expandThumb(0);
                document.getElementById('textEntryButton').style.display = 'none';
                document.getElementById('textentryBox').style.display = 'none';
            }
            handleWindowResize();
        },20);
    });
}
