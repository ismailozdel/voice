import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:8000/', {
  transports: ['websocket'],
  cors: {
    origin: "http://localhost:5000/"
  }
})


/*const socket = io('https://test.heynova.work/',{
  transports:['websocket'],
        cors:{
          origin:"https://test2.heynova.work/"
        }
})*/
function VoiceChat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const handleRoom = (e) => {
    const inputMessage = e.target.value;
    setRoom(inputMessage);
  };
  const handleUsername = (e) => {
    const inputMessage = e.target.value;
    setUsername(inputMessage);
  }
  const handleSubmitRoom = () => {
    if (!room) {
      return;
    }
    socket.emit("join_room", { "room": room, "username": username });
  };
  const [audioContext, setAudioContext] = useState(null)
  const [microphoneStream, setMicrophoneStream] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
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
  }, [])

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
      socket.emit('audio_data', { "audio": microphoneOutput })
    }
    // handle audio data received from the server
    socket.on('audio_data', (data) => {

      console.log(new Float32Array(data))

      const test = new Float32Array(data)

      const audioBuffer = audioContext.createBuffer(1, test.length, audioContext.sampleRate)
      // create an audio buffer from the received data

      audioBuffer.copyToChannel(new Float32Array(data), 0)


      // create an audio source from the buffer
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      // connect the source to the audio context destination
      source.connect(audioContext.destination)
      // play the audio
      source.start()
    })

    // set the connected flag
    setIsConnected(true)

    return () => {
      // disconnect the audio nodes and close the audio context
      microphoneInput.disconnect()
      processor.disconnect()
      audioContext.close()
      // set the connected flag
      setIsConnected(false)
    }
  }, [audioContext, microphoneStream])
  /**
   *       <input type="text" value={username} onChange={handleUsername} placeholder="username" />
      <input type="text" value={room} onChange={handleRoom} placeholder="room" />
      <button onClick={handleSubmitRoom}>submit</button>
   * 
   */
  return (
    <div>
      <input type="text" value={username} onChange={handleUsername} placeholder="username" />
      <input type="text" value={room} onChange={handleRoom} placeholder="room" />
      <button onClick={handleSubmitRoom}>submit</button>
      {isConnected ? 'Connected to voice chat' : 'Connecting to voice chat...'}
    </div>
  )
}

export default VoiceChat
