import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:8000/', {
  transports: ['websocket'],
  cors: {
    origin: "http://localhost:3000/"
  }
})
/*
const socket = io('https://test.heynova.work/', {
  transports: ['websocket'],
  cors: {
    origin: "https://test2.heynova.work/"
  }
})*/

function App() {
  const [audioContext, setAudioContext] = useState(null)
  const [microphoneStream, setMicrophoneStream] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const [userName, setUserName] = useState('')
  const [targetUser, setTargetUser] = useState('')

  useEffect(() => {
    if (isConnected) {
      async function init() {
        try {
          // initialize audio context and get microphone input stream
          const audioCtx = new AudioContext()
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setAudioContext(audioCtx)
          setMicrophoneStream(stream)
        } catch (error) {
          console.error(error)
        }
      }
      init()
    }
  }, [isConnected])

  useEffect(() => {
    if (!audioContext || !microphoneStream) {
      return
    }

    // create audio nodes
    const microphoneInput = audioContext.createMediaStreamSource(microphoneStream)
    const processor = audioContext.createScriptProcessor(1024, 1, 1)

    // connect the nodes
    microphoneInput.connect(processor)
    processor.connect(audioContext.destination)

    // handle audio data
    processor.onaudioprocess = (event) => {
      // get microphone output data
      const microphoneOutput = event.inputBuffer.getChannelData(0)
      // send it to the server over the Socket.IO connection
      if (!isMuted && roomName) {
        socket.emit('audio_data', { "audio": microphoneOutput, "room": roomName })
      }
    }

    // handle audio data received from the server
    socket.on('audio_data', (data) => {
      const test = new Float32Array(data)
      console.log("-----")
      console.log(test)
      console.log("//")
      // create an audio buffer from the received data
      const audioBuffer = audioContext.createBuffer(1, test.length, audioContext.sampleRate)
      audioBuffer.copyToChannel(new Float32Array(data), 0)
      // create an audio source from the buffer
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      // connect the source to the audio context destination
      source.connect(audioContext.destination)
      // play the audio
      source.start()
    })
    socket.on('notification',(data)=>{
      console.log(1)
      console.log(data)
      console.log(data['notification'])
    })

    return () => {
      // disconnect the audio nodes and close the audio context
      microphoneInput.disconnect()
      processor.disconnect()
      audioContext.close()
    }
  }, [audioContext, microphoneStream, roomName, isMuted])

  function joinRoom() {
    socket.emit('join room', { room_name: roomName })
    setIsConnected(true)
  }
  function register() {
    socket.emit('register', { user_name: userName })
  }
  function sendNotification() {
    socket.emit('send notification', { user_name: userName, target_user: targetUser })
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <input
        type="text"
        placeholder="enter user name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={register}>Register</button>
      <div>
        <input
          type="text"
          placeholder="enter user name"
          value={targetUser}
          onChange={(e) => setTargetUser(e.target.value)} />
        <button onClick={sendNotification}>send notification</button>
      </div>
      
      {isConnected ? (
        <div>
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={() => {
            setIsConnected(false)
            setRoomName('')
            socket.emit('leave room', roomName)
          }
          }>Leave Room</button>
        </div>
      ) : null}
    </div>
  )
}
export default App;


/*import { useEffect, useState } from 'react';
import './App.css';
import HttpCall from './components/HttpCall';
import WebSocketCall from './components/WebSocketCall';
import {io} from 'socket.io-client'
import VoiceChat from './components/VoiceChat';

function App() {

  const [socketInstance,setSocketInstance] = useState("")
  const [loading,setLoading] = useState(true)
  const [buttonStatus,setButtonStatus] = useState(false)
  const [voiceButtonStatus,setVoiceButtonStatus] = useState(false)
  useEffect(() => {
    if(buttonStatus === true){
       const socket = io("http://localhost:8000",{
        transports:['websocket'],
        cors:{
          origin:"http://localhost:5000/"
        }
      })

      setSocketInstance(socket)

      socket.on('connect',(data) => {
        console.log(data)
      })

      setLoading(false)

      socket.on('disconnect',(data)=> {
        console.log(data)
      })

      return function cleanup(){
        socket.disconnect()
      }

    }
  },[buttonStatus])

  const handleClick = () => {
    if(buttonStatus === false){
      setButtonStatus(true)
    }else{
      setButtonStatus(false)
    }
  }
  const voiceButtonHandleClick = () => {
    if(voiceButtonStatus === false){
      setVoiceButtonStatus(true)
    }else{
      setVoiceButtonStatus(false)
    }
  }

  return (
    <div className="App">
      <h1>React Flask App</h1>
        <div className='line'>
          <HttpCall/>
        </div>

        {!buttonStatus ? (
          <button onClick={handleClick}>Turn Chat on</button>
        ): <>
        <button onClick={handleClick}>Turn Chat off</button>
        <div className="line">
          {!loading && <WebSocketCall socket={socketInstance}/>}
        </div>
        </>}

      <h1>App</h1>
          {!voiceButtonStatus ? (
            <button onClick={voiceButtonHandleClick}>Connect voice channel</button>
          ): <>
          <button onClick={voiceButtonHandleClick}>disconnect</button>
          <div className="line">
          {!loading && <VoiceChat socket={socketInstance}/>}
          </div>
          </>}

        </div>
  );
}

export default App;*/
