import React, { useEffect, useRef } from 'react';

const VoiceWaveform = ({ isRecording, audioStream }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (!isRecording || !audioStream || !canvasRef.current) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    const draw = () => {
      // Drawing logic for waveform visualization
      analyser.getByteTimeDomainData(dataArray);
      
      // Scale canvas for high DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasCtx.scale(dpr, dpr);
      
      canvasCtx.fillStyle = 'rgb(20, 20, 20)';
      canvasCtx.fillRect(0, 0, rect.width, rect.height);
      
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(75, 213, 238)';
      canvasCtx.beginPath();
      
      const sliceWidth = rect.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (rect.height / 2);
        
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      canvasCtx.lineTo(rect.width, rect.height / 2);
      canvasCtx.stroke();
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      audioContext.close().catch(console.error);
    };
  }, [isRecording, audioStream]);
  
  return (
    <div className="voice-waveform w-full h-16 my-2">
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full rounded-md ${isRecording ? 'border-2 border-primary-500' : 'border border-gray-300 dark:border-gray-700'}`}
      />
    </div>
  );
};

export default VoiceWaveform;
