function timeFormat (currentTime) {
  let hours = String(Math.trunc(currentTime / 10))
  currentTime -= hours * 3600
  let minutes = String(Math.trunc(currentTime / 60))
  currentTime -= minutes * 60
  let seconds = String(currentTime)
  let strTime = ''
  if (hours == '0') {
    strTime = `${minutes.length == 1 ? '0' + minutes : minutes}:${seconds.length == 1 ? '0' + seconds : seconds}`
  } else {
    strTime = `${hours.length == 1 ? '0' + hours : hours}:${minutes.length == 1 ? '0' + minutes : minutes}:${seconds.length == 1 ? '0' + seconds : seconds}`
  }

  return strTime
}

export const phoneState = {
  userInCall: false,
  callNumber: '',
  callInProgress: false,
  callDuration: 0,
  callTimer: null,
  callInfo: { status: '', label: '', info: '' },
  userInfo: {name:'Usuario Pbx', avatar: '/static/images/male.png', extension: '???'},
  seconduserInfo: {name:'Usuario Pbx', avatar: '/static/images/male.png', extension: '???'},
  callDirection: '',
  phoneSmall: false,
  showPhone: false,
  pjsipAccount: '',
  phoneStatus: 'UNREGISTERED',
  isMuted: false,
  isHold: false,
  keyboardActive: true,
  showCallButton: true,
  showHangupButton: false,
  currentCallSession:false,
  callEvents: [],
  // call actions states
  disableInput: false,
  disableCallAnswer: false,
  disableCallHangUp: false,
  // Tranfer conference
  warnTransfer: false,
  isTransferInvited: false,
  transferCallId: '',
  transferType: '',
  // Conference parameters
  userInConference: false,
  conferenceMembers: [],
  userConferenceRole: '',
  showConferenceOptions: false,
  conferenceId: '',
  conferenceStarted: null,
  conferenceRecordDuration: 0,
  recordConference: false,
  recordTimer: null,
  conferenceCallInfo: { status: '', label: '', info: '' },
  conferenceCallDuration: 0,
  isAddingMember: false,
  extensionAdded: '',
  invitationData: null,
  targetConferenceEndpoint: '',

  // states for ContactBrowser Component
  showBrowser: false,
  browserTitle: '',
  browserContacts: [],
  choosenNumber: '',
  browserAction: '',
  pjsipContacts: [],

  // states for snackbar notification
  snackbarMessage: '',
  showSnackbar: false,

  // state for mobile UI
  isMobileDevice: false,

  // states for call status
  showCallStatistics: false,
  inCallPeers: [],
  peerConnection: null,
  localIp: '',
  RTCStatisticTimer: null,
  localDescription: null,
  remoteDescription: null,
  callQuality: -1,
}

export const phoneGetters = {
  callDurationFormat: state => {
    return timeFormat(state.callDuration)
  },
  recordDurationFormat: state => {
    return timeFormat(state.conferenceRecordDuration)
  }
}

export const phoneMutations = {
  ACTIVATE_TRANSFER (state) {
    state.warnTransfer = true
  },
  APPEND_DIGIT (state, digit) {
    let currentNumber = state.callNumber
    state.callNumber = currentNumber + digit
  },
  CHANGE_PHONE_STATE (state, phoneState) {
    state.phoneStatus = phoneState
  },
  REMOVE_DIGIT (state) {
    currentNumber = state.callNumber
    state.callNumber = currentNumber.slice(0, currentNumber.length - 1)
  },
  RESET_NUMBER (state) {
    state.callNumber = ''
  },
  INIT_CALL (state, number) {
    if (state.userInCall == true || state.userInConference == true) {
      alertError('No se puede llamar mientras se esta en una llamada')
      return
    }
    state.callNumber = number
    state.showPhone = true
  },
  HANGUP_CALL (state) {
    console.log('mutation HANGUP_CALL')
    state.userInCall = false
    state.callNumber = ''
    state.callInProgress = false
    state.callDuration = 0
    state.callDirection = ''
    state.phoneSmall = false
    state.isMuted = false
    state.isHold = false
    state.keyboardActive = true
    state.warnTransfer = false
    clearInterval(state.callTimer)
    state.callTimer = null
    state.phoneStatus = 'REGISTERED'
    state.callInfo = { status: '', label: '', info: '' }
    state.showCallButton = true
    state.currentCallSession = false
    state.showHangupButton = false
    state.callEvents = []
    // call actions states
    state.disableInput = false
    state.disableCallAnswer = false
    state.disableCallHangUp = false
    // conference parameters
    state.conferenceId = ''
    state.conferenceMembers = []
    state.conferenceStarted = null
    state.userInConference = false
    state.userConferenceRole = ''
    state.showConferenceOptions = false
    state.conferenceRecordDuration = 0
    state.recordConference = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.conferenceCallDuration = 0
    state.isAddingMember = false
    state.invitationData = null
    state.targetConferenceEndpoint = ''
    // contact browser
    state.showBrowser = false
    state.choosenNumber = ''

    // RTC stattistics
    state.showCallStatistics = false
    state.inCallPeers = []
    state.peerConnection = null
    clearInterval(state.RTCStatisticTimer)
    state.localDescription = null
    state.remoteDescription =  null
    state.callQuality = -1
  },
  START_CALL (state) {
    state.keyboardActive = false
    state.callInProgress = true
    state.phoneStatus = 'BUSY'
    state.showHangupButton = true
  },
  ANSWER_CALL (state) {
    state.callTimer = setInterval(function () {
      state.callDuration += 1
    }, 1000)
    state.phoneStatus = 'IN_CALL'
    state.userInCall = true
    state.showCallButton = false
  },
  SET_CALL_DIRECTION (state, direction) {
    state.callDirection = direction
  },
  SET_PHONE_STATE (state, { phoneVar, phoneState }) {
    state[phoneVar] = phoneState
  },
  UPDATE_CALL_INFO (state, callInfo) {
    Object.assign(state.callInfo, callInfo)
  },
  UPDATE_CONFERENCE_INFO (state, conferenceInfo) {
    Object.assign(state.conferenceCallInfo, conferenceInfo)
  },
  UPDATE_USER_INFO (state, userInfo) {
    Object.assign(state.userInfo, userInfo)
  },
  TOGGLE_PHONE (state) {
    state.showPhone = !state.showPhone
  },

  // Mutations for conference call
  INIT_CONFERENCE (state, { conferenceId, userConferenceRole, conferenceStarted }) {
    state.userInConference = true
    state.userConferenceRole = userConferenceRole
    state.conferenceId = conferenceId
    state.conferenceStarted = new Date(conferenceStarted)
  },
  ADD_CONFERENCE_MEMBER (state, { members, conferenceId, extensionAdded }) {
    console.log('entro mutacion ADD_CONFERENCE_MEMBER')
    if (state.conferenceId == conferenceId) {
      var oldMembers = state.conferenceMembers
      state.conferenceMembers = members

      var newMember = null
      for (var i = 0; i < members.length; i++) {
        var memberExists = oldMembers.filter(x => x.extension == members[i].extension).length > 0
        if (memberExists == false) {
          newMember = members[i]// oldMembers.filter(x => x.extension == members[i].extension)[0]
        }
      }

      if (state.extensionAdded == extensionAdded) {
        state.isAddingMember = false
        state.conferenceCallInfo = { status: '', label: '', info: '' }
        state.extensionAdded = ''
      }

      // show snackbar with new member added
      state.snackbarMessage = `${newMember.name} ha sido agregado a la conferencia`
      state.showSnackbar = true
    }
  },
  CALL_CONFERENCE_MEMBER (state, { callInfo, number }) {
    console.log('entro mutacion CALL_CONFERENCE_MEMBER')
    console.log(callInfo)
    Object.assign(state.conferenceCallInfo, callInfo)
    state.isAddingMember = true
    state.extensionAdded = number
  },
  REMOVE_CONFERENCE_MEMBER (state, { member, conferenceId }) {
    if (state.conferenceId == conferenceId) {
      var removedMember = state.conferenceMembers.filter(x => x.extension == member)[0]
      state.conferenceMembers = state.conferenceMembers.filter(x => x.extension != member)

      // show snackbar with removed member
      state.snackbarMessage = `${removedMember.name} ha abandonado la conferencia`
      state.showSnackbar = true
    }
  },
  TOGGLE_CONFERENCE_RECORD (state) {
    newValue = !state.recordConference
    state.recordConference = newValue
    if (newValue == true) {
      state.recordTimer = setInterval(function () {
        state.conferenceRecordDuration += 1
      }, 1000)
    } else {
      clearInterval(state.recordTimer)
    }
  },
  REMOVE_INVITED_CHANNEL (state) {
    state.isAddingMember = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.extensionAdded = ''
  },
  INVITED_REJECT (state) {
    // show snackbar with the invited that reject
    state.snackbarMessage = `${state.conferenceCallInfo.label} ha rechazado invitación`
    state.showSnackbar = true
    state.targetConferenceEndpoint = ''

    state.isAddingMember = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.extensionAdded = ''
  },
  RECEIVE_CONFERENCE_INVITATION (state, invitationData) {
    state.invitationData = invitationData
    // state.conferenceId = conferenceId
  },

  // Mutations for ContactBrowser Component
  SET_CONTACTS (state, contacts) {
    state.browserContacts = contacts
  },
  SHOW_DIALOG (state, type) {
    let title = ''
    switch (type) {
      case 'warn':
        title = 'Elegir destino tranferencia atendida'
        break
      case 'blind':
        title = 'Elegir destino tranferencia ciega'
        break
      case 'conference':
        title = 'Agregar miembro conferencia'
        break
    }
    state.showBrowser = true
    state.browserTitle = title
    state.browserAction = type
  },
  CLOSE_DIALOG (state) {
    state.showBrowser = false
    state.browserTitle = ''
    state.browserAction = ''
  },

  // Mutations for snackbar Component
  SHOW_MESSAGE (state, message) {
    state.snackbarMessage = message
    state.showSnackbar = true
  },

  // Mutations for call Statistics
  TOGGLE_STATISTIC (state) {
    state.showCallStatistics = !state.showCallStatistics
  },
  INIT_STATISTIC (state) {
    inboundKeys = ['ssrc', 'packetsReceived', 'bytesReceived', 'packetsLost', 'jitter']
    outboundKeys = ['ssrc', 'packetsSent', 'bytesSent', 'packetsLost']
    localPeer = Object.assign(state.userInfo, {localIp: state.localIp})
    state.inCallPeers.push(localPeer)
    remotePeer = state.seconduserInfo
    state.inCallPeers.push(remotePeer)

    // acum variables to measure the speed
    prevBytes = 0
    prevPackets = 0

    state.RTCStatisticTimer = setInterval(function () {
      state.peerConnection.getStats(null).then(stats => {
      stats.forEach(report => {
        if (report.type == 'outbound-rtp' || report.type == 'inbound-rtp' ) { //|| report.type == 'inbound-rtp'         
          peerIndex = report.type == 'outbound-rtp' ? 0 : 1
          statsObj = state.inCallPeers[peerIndex] 
          statsObj['statDirection'] = report.type == 'outbound-rtp' ? 'outbound' : 'inbound'
          checkList = report.type == 'outbound-rtp' ? outboundKeys : inboundKeys
          Object.keys(report).forEach(statName => {
            if (checkList.includes(statName)) {
              statsObj[statName] = report[statName] 
              if (statName == 'jitter'){
                state.callQuality = parseFloat(report[statName]) * 1000
              }             
            }
          });

          varBytes = report.type == 'outbound-rtp' ? statsObj.bytesSent : statsObj.bytesReceived
          varPackets = report.type == 'outbound-rtp' ? statsObj.packetsSent : statsObj.packetsReceived

          statsObj.byteRate = prevBytes == 0 ? varBytes : varBytes - prevBytes
          statsObj.packetsRate = prevBytes == 0 ? varPackets : varPackets - prevPackets

          prevBytes = varBytes
          prevPackets = varPackets

          Vue.set(state.inCallPeers, peerIndex, statsObj)
          
        } 
      });
    });
    }, 1000)
  },

}

// ctxSip = {
//           config : {
//             password        : '1234',
//             displayName     : ' Test App_2',
//             uri             : 'sip:'+user.User+'@'+user.Realm,
//             wsServers       : user.WSServer,
//             stunServers: ["stun:stun.l.google.com:19302"],
//             traceSip        : true,
//             log             : {
//                 level : 0,
//             }
//           },
//           ringtone     : document.getElementById('ringtone'),
//           ringbacktone : document.getElementById('ringbacktone'),
//           dtmfTone     : document.getElementById('dtmfTone'),

//           Sessions     : [],
//           callTimers   : {},
//           callActiveID : null,
//           callVolume   : 1,
//           Stream       : null,
//           currentSession: null,
//           clickToDial  : null,

//           /**
//            * Parses a SIP uri and returns a formatted US phone number.
//            *
//            * @param  {string} phone number or uri to format
//            * @return {string}       formatted number
//            */
//           formatPhone : function(phone) {
//             var num;

//             if (phone.indexOf('@')) {
//               num =  phone.split('@')[0];
//             } else {
//               num = phone;
//             }

//             num = num.toString().replace(/[^0-9]/g, '');

//             if (num.length === 10) {
//               return '(' + num.substr(0, 3) + ') ' + num.substr(3, 3) + '-' + num.substr(6,4);
//             } else if (num.length === 11) {
//               return '(' + num.substr(1, 3) + ') ' + num.substr(4, 3) + '-' + num.substr(7,4);
//             } else {
//               return num;
//             }
//           },

//           // Sound methods
//           startRingTone : function() {
//             try { ctxSip.ringtone.play(); } catch (e) { }
//           },

//           stopRingTone : function() {
//             try { ctxSip.ringtone.pause(); } catch (e) { }
//           },

//           startRingbackTone : function() {
//             //try { ctxSip.ringbacktone.play(); } catch (e) { }
//             console.log("telefono sin ring por ahora");
//           },

//           stopRingbackTone : function() {
//             try { ctxSip.ringbacktone.pause(); } catch (e) { }
//           },

//           // Genereates a rendom string to ID a call
//           getUniqueID : function() {
//             return Math.random().toString(36).substr(2, 9);
//           },

//           newSession : function(newSess) {
//             console.log("Entro funcion newSession: "+newSess.direction)
//             console.log(newSess);
//             ctxSip.currentSession = {session: newSess};
//             newSess.displayName = newSess.remoteIdentity.displayName || newSess.remoteIdentity.uri.user;
//             newSess.ctxid       = ctxSip.getUniqueID();
//             var status;

//             ctxSip.callActiveID = newSess.ctxid

//             if (newSess.direction === 'incoming') {
//               sessionDirection = 'incoming';
//               status = "Llamada entrante: "+ newSess.displayName;




//               // acciones para el sofphone movil

//               if (!window.location.pathname.includes('mobile_phone')){
//                 params = {'show': 'yes'};
//                 changeView('mobile_phone', params);
//               }


//               vueApp.$store.dispatch('incommingCall', newSess.displayName)
//               ctxSip.callActiveID = newSess.ctxid
//             } 


//             ctxSip.setCallSessionStatus(status);

//             // EVENT CALLBACKS

//             newSess.on('SessionDescriptionHandler-created', function() {
//               console.log('ENTRO EVENTO PEERCONNECTION')
//               // console.log(newSess)
//               // console.log(newSess.sessionDescriptionHandler)
//               // var peerConnection = newSess.sessionDescriptionHandler.peerConnection;
//               // var remoteStream = peerConnection.getRemoteStreams()[0];
//               // console.log(remoteStream)
//             });

//             newSess.on('progress',function(e) {


//               // localStorage.setItem('currentObj', JSON.stringify(e));
//               traceLog("Evento progress direccion: "+ e.direction, 1)
//               if (e.direction === 'outgoing') {
//                   ctxSip.setCallSessionStatus('Llamando');
//               }
//             });

//             newSess.on('connecting',function(e) {

//               traceLog("Evento connecting direccion: "+ e.direction, 1)
//               console.log(e);
//               $("#btnCallNow").prop('hidden', true);
//               $('.mobile-phone-container .btnHangup').css('margin-left', '0px');
//               if (e.direction === 'outgoing') {
//                 ctxSip.setCallSessionStatus('Conectando');
//               }
//             });

//             newSess.on('accepted',function(e) {

//               // If there is another active call, hold it
//               peerConnection = this.mediaHandler.peerConnection
//               vueApp.$store.commit('SET_PHONE_STATE', {phoneVar:'peerConnection', phoneState:peerConnection})
//               traceLog("Evento accepted", 1);
//               // vueApp.$store.dispatch('convertSDP')
//               vueApp.$store.dispatch('answerCall')

//               // acciones softphone movil
//               $('.mobile-phone-container .option-icon').prop('disabled', false);
//               $('.mobile-phone-container #numDisplay').prop('disabled', true);
//               $('.mobile-phone-container .phone-backspace').prop('hidden', true);
//               $('.mobile-phone-container #numDisplay').parent().removeClass('col-9').addClass('col-11');


//               if (ctxSip.callActiveID && ctxSip.callActiveID !== newSess.ctxid) {
//                 ctxSip.phoneHoldButtonPressed(ctxSip.callActiveID);
//               }

//               ctxSip.stopRingTone();
//               ctxSip.callActiveID = newSess.ctxid;

//             });

//             newSess.on('hold', function(e) {
//               ctxSip.fireHoldEvent();
//             });

//             newSess.on('unhold', function(e) {
//               ctxSip.fireUnHoldEvent(newSess)
//             });

//             newSess.on('muted', function(e) {
//               ctxSip.fireMuteEvent(newSess);
//             });

//             newSess.on('unmuted', function(e) {
//               ctxSip.fireUnMuteEvent(newSess);
//             });

//             newSess.on('cancel', function(e) {

//               traceLog("Evento cancel direccion: ", 1)
//               console.log(ctxSip.clickToDial);

//               // if call is zoho click to dial and call isnot answer
//               if (!!ctxSip.clickToDial) {
//                 vueApp.rejectClickToCall('noanswer')
//               }

//               ctxSip.setCallSessionStatus("Cancelada");
//               if (this.direction === 'outgoing') {
//                 ctxSip.callActiveID = null;
//                 newSess             = null;
//                 // restartPhoneControls();
//                 vueApp.$store.dispatch('finishCall')
//               }
//             });

//             newSess.on('bye', function(e) {

//               traceLog(e);
//               traceLog("Evento bye direccion: ", 1);
//               vueApp.$store.dispatch('finishCall')
//               ctxSip.callActiveID = null;
//               newSess             = null;
//             });

//             newSess.on('failed',function(e) {

//               vueApp.$store.dispatch('finishCall')
//               traceLog("Evento failed direccion: ", 1);
//             });

//             newSess.on('rejected',function(e) {

//               traceLog("Evento rejected direccion: ", 1)
//               vueApp.$store.dispatch('finishCall')
//               ctxSip.callActiveID = null;
//               newSess             = null;

//             });

//             ctxSip.Sessions[newSess.ctxid] = newSess;
//           },

//           // getUser media request refused or device was not present
//           getUserMediaFailure : function(e) {
//             console.log("entro funcion getUserMediaFailure");
//             window.console.error('getUserMedia failed:', e);
//             ctxSip.setError(true, 'Sin micrófono.', 'No detectamos tu micrófono, revisa que esté habilitado en tu navegador, revisa la barra de direcciones.', true);
//           },

//           getUserMediaSuccess : function(stream) {
//             ctxSip.Stream = stream;
//           },

//           setCallSessionStatus : function(status) {
//             $('.txtCallStatus').html(status);
//           },

//           setStatus : function(status) {
//             $("#txtRegStatus").html('<i class="fa fa-signal"></i> '+status);
//           },

//           fireMuteEvent: function(newSess){
//             ctxSip.Sessions[newSess.ctxid].isMuted = true;
//             ctxSip.setCallSessionStatus("Silenciada");
//           },

//           fireUnMuteEvent: function(newSess){
//             ctxSip.Sessions[newSess.ctxid].isMuted = false;
//             ctxSip.setCallSessionStatus("Contestada");
//           },

//           fireHoldEvent: function(){
//             traceLog("Evento hold", 1)
//           },

//           fireUnHoldEvent: function(newSess){
//             traceLog("Evento unhold", 1)
//             ctxSip.callActiveID = newSess.ctxid;
//           },

//           fireDMTFEvent: function(dig){
//             vueApp.$store.commit('SET_PHONE_STATE',{phoneVar:'callNumber', phoneState: vueApp.$store.state.callNumber+dig})
//           },

//           fireAnswerEvent: function(){
//             $("#screenHoldOn").hide(1)
//             var sessionid = ctxSip.callActiveID;
//             ctxSip.phoneCallButtonPressed(sessionid);
//           },

//           sipCall : function(target) {
//             console.log("target sipcall: "+target)
//             console.log(ctxSip.Stream)
//             try {
//               var s = ctxSip.phone.invite(target, {
//                 media : {
//                   stream      : ctxSip.Stream,
//                   constraints : { audio : true, video : false },
//                   render      : {
//                       remote : $('#audioRemote').get()[0]
//                   },
//                   RTCConstraints : { "optional": [{ 'DtlsSrtpKeyAgreement': 'true'} ]}
//                 },
//                 rel100: SIP.C.supported.SUPPORTED,
//                 earlyMedia: true
//                 // inviteWithoutSdp: true
//               });
//               console.log("asignar stream en sipCall")
//               s.direction = 'outgoing';
//               ctxSip.newSession(s);

//             } catch(e) {
//               throw(e);
//             }
//           },

//         sipTransfer : function(sessionid) {
//           console.log("Entro funcion sipTransfer")
//           var s      = ctxSip.Sessions[sessionid],
//               target = window.prompt('Ingrese número destino', '');
//           console.log("paso var s")
//           ctxSip.setCallSessionStatus('<i>Transfering the call...</i>');
//           console.log("paso setCallSessionStatus")
//           s.refer(target);
//           console.log("paso s.refer(target)")
//         },

//         sipHangUp : function(sessionid) {
//           console.log("entro sipHangUp sessionid: "+sessionid)
//           var s = ctxSip.Sessions[sessionid];
//           // s.terminate();
//           if (!s) {
//             return;
//           } else if (s.startTime) {
//             console.log("entro s.startTime: "+s.startTime)
//             s.bye();
//           } else if (s.reject) {
//             console.log("entro s.reject: "+s.reject)
//             s.reject();
//           } else if (s.cancel) {
//             console.log("entro s.cancel: "+s.cancel)
//             s.cancel();
//           }
//         },

//         sipSendDTMF : function(digit) {
//           $('#dial-in-call').val($('#dial-in-call').val()+digit);
//           try { ctxSip.dtmfTone.play(); } catch(e) { }

//           var a = ctxSip.callActiveID;
//           if (a) {
//             var s = ctxSip.Sessions[a];
//             s.dtmf(digit);
//           }
//         },

//         phoneCallButtonPressed : function(sessionid) {
//           traceLog("Funcion phoneCallButtonPressed sessionid: "+ sessionid, 1)
//           var s      = ctxSip.Sessions[sessionid],
//           target = vueApp.$store.state.callNumber.trim();

//           if (!s) {

//             // $("#numDisplay").val("");
//             ctxSip.sipCall(target);

//           } else if (s.accept && !s.startTime) {
//             console.log("asignar stream en phoneCallButtonPressed")
//             s.accept({
//               media : {
//                 stream      : ctxSip.Stream,
//                 constraints : { audio : true, video : false },
//                 render      : {
//                     remote : $('#audioRemote').get()[0]
//                 },
//                 RTCConstraints : { "optional": [{ 'DtlsSrtpKeyAgreement': 'true'} ]}
//               }
//             });
//           }
//         },

//         phoneMuteButtonPressed : function (sessionid) {
//           var s = ctxSip.Sessions[sessionid];

//           if (!s.isMuted) {
//               s.mute();
//           } else {
//               s.unmute();
//           }
//         },

//         phoneHoldButtonPressed : function(sessionid) {
//           traceLog("Funcion phoneHoldButtonPressed ", 1)
//           console.log("sessionid: "+sessionid)
//           var s = ctxSip.Sessions[sessionid];
//           console.log(s)
//           console.log("s.isOnHold().local: "+s.isOnHold().local)
//           if (s.isOnHold().local === true) {
//               console.log("entro s.unhold")
//               s.unhold();
//           } else {
//               s.hold();
//               console.log("entro s.hold")
//           }
//         },

//         setError : function(err, title, msg, closable) {
//           $('#sophone-error').prop('hidden',false);
//           $('#sophone-error').text(msg);
//         },

//         removeError : function(){
//           $('#sophone-error').prop('hidden',true);
//           $('#sophone-error').text('');
//         },

//         /**
//          * Tests for a capable browser, return bool, and shows an
//          * error modal on fail.
//          */
//         hasWebRTC : function() {
//           if (navigator.webkitGetUserMedia) {
//             return true;
//           } else if (navigator.mozGetUserMedia) {
//             return true;
//           } else if (navigator.getUserMedia) {
//             return true;
//           } else {
//             ctxSip.setError(true, 'Navegador no soportado.', 'Su navegador no soporta comunicaciones RTC. Utilice un navegador compatible.');
//             window.console.error("WebRTC support not found");
//             return false;
//           }
//         }
//       };


//function
