import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, Info } from 'lucide-react';

const MicrophoneTest = ({ onClose }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startMicrophoneTest = async () => {
    try {
      setError('');
      setTestResult(null);
      setAudioLevel(0);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });

      // Create audio context and analyser
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      // Connect microphone to analyser
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsTesting(true);

      // Monitor audio levels
      const updateAudioLevel = () => {
        if (!isTesting) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const normalizedLevel = (average / 255) * 100;
        
        setAudioLevel(normalizedLevel);

        // Determine test result based on audio level
        if (normalizedLevel > 5) {
          setTestResult('success');
          setIsTesting(false);
          stopMicrophoneTest();
        }

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isTesting) {
          setTestResult('no-audio');
          setIsTesting(false);
          stopMicrophoneTest();
        }
      }, 10000);

    } catch (error) {
      console.error('Microphone test error:', error);
      setError(`Microphone test failed: ${error.message}`);
      setTestResult('error');
      setIsTesting(false);
    }
  };

  const stopMicrophoneTest = () => {
    setIsTesting(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const getTestResultMessage = () => {
    switch (testResult) {
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-success-600" />,
          title: 'Microphone Working!',
          message: 'Your microphone is working correctly. You can now use voice input.',
          color: 'text-success-600'
        };
      case 'no-audio':
        return {
          icon: <AlertCircle className="h-6 w-6 text-warning-600" />,
          title: 'No Audio Detected',
          message: 'No audio was detected. Please check your microphone and try again.',
          color: 'text-warning-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-danger-600" />,
          title: 'Microphone Error',
          message: 'There was an error accessing your microphone. Please check permissions.',
          color: 'text-danger-600'
        };
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Microphone Test</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-danger-600" />
              <span className="text-danger-700">{error}</span>
            </div>
          </div>
        )}

        {testResult && getTestResultMessage() && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getTestResultMessage().icon}
              <div>
                <h3 className={`font-medium ${getTestResultMessage().color}`}>
                  {getTestResultMessage().title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getTestResultMessage().message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Audio Level Indicator */}
          {isTesting && (
            <div className="text-center">
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary-500 h-4 rounded-full transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Audio Level: {audioLevel.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Speak into your microphone to test...
              </p>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={isTesting ? stopMicrophoneTest : startMicrophoneTest}
            disabled={testResult === 'success'}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              isTesting
                ? 'bg-danger-500 hover:bg-danger-600 text-white'
                : testResult === 'success'
                ? 'bg-success-500 text-white cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isTesting ? (
                <>
                  <MicOff className="h-5 w-5" />
                  <span>Stop Test</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Start Microphone Test</span>
                </>
              )}
            </div>
          </button>

          {/* Instructions */}
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">Test Instructions:</h4>
            <ul className="space-y-1">
              <li>• Click "Start Microphone Test"</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Speak into your microphone</li>
              <li>• The test will detect audio levels</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrophoneTest; 