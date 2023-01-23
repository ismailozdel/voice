import { useEffect, useState } from 'react';
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

export default App;
