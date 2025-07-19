import React, { useState, useEffect, useRef } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Save, Volume2, AlertCircle, Info, CheckCircle, Settings } from 'lucide-react';
import MicrophoneTest from './MicrophoneTest';

const VoiceInput = () => {
  const { categories, addTransaction } = useTransactions();
  const navigate = useNavigate();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(null);
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  const [showMicrophoneTest, setShowMicrophoneTest] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const checkBrowserSupport = () => {
      const support = {
        webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        speechRecognition: 'SpeechRecognition' in window,
        supported: false,
        browser: navigator.userAgent
      };
      
      support.supported = support.webkitSpeechRecognition || support.speechRecognition;
      setBrowserSupport(support);
      setDebugInfo(support);
      
      if (!support.supported) {
        setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return false;
      }
      return true;
    };

    // Check microphone permissions
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          setMicrophonePermission(permission.state);
          
          permission.onchange = () => {
            setMicrophonePermission(permission.state);
          };
          
          return permission.state === 'granted';
        }
        return true; // Assume granted if permissions API not available
      } catch (error) {
        console.log('Microphone permission check failed:', error);
        return true; // Assume granted
      }
    };

    // Initialize speech recognition
    const initializeSpeechRecognition = async () => {
      if (!checkBrowserSupport()) return;
      
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission is required. Please allow microphone access and refresh the page.');
        return;
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Configure recognition settings
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        // Event handlers
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setError('');
        };
        
        recognitionRef.current.onresult = (event) => {
          console.log('Speech recognition result:', event);
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript || interimTranscript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event);
          let errorMessage = 'Speech recognition error';
          
          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
              break;
            case 'no-speech':
              errorMessage = 'No speech detected. Please speak clearly.';
              break;
            case 'audio-capture':
              errorMessage = 'Audio capture error. Please check your microphone.';
              break;
            case 'network':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not allowed.';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          setError(errorMessage);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        
        setDebugInfo(prev => ({ ...prev, recognitionInitialized: true }));
        
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setError(`Failed to initialize speech recognition: ${error.message}`);
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    try {
      // Request microphone permission if needed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      recognitionRef.current.start();
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else {
        setError(`Failed to start speech recognition: ${error.message}`);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log('Stopping speech recognition...');
    }
  };

  const parseVoiceInput = (text) => {
    const lowerText = text.toLowerCase();
    let parsed = {
      type: 'expense',
      description: '',
      amount: 0,
      category: 'other',
      date: new Date().toISOString().split('T')[0]
    };

    // Extract amount
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      parsed.amount = parseFloat(amountMatch[1]);
    }

    // Determine transaction type
    if (lowerText.includes('income') || lowerText.includes('earned') || lowerText.includes('salary') || lowerText.includes('payment')) {
      parsed.type = 'income';
    }

    // Extract category
    const categoryKeywords = {
      food: ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'groceries', 'coffee'],
      transport: ['transport', 'gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking'],
      entertainment: ['entertainment', 'movie', 'concert', 'game', 'fun', 'party'],
      shopping: ['shopping', 'clothes', 'shoes', 'store', 'mall', 'purchase'],
      health: ['health', 'medical', 'doctor', 'pharmacy', 'medicine', 'hospital'],
      education: ['education', 'school', 'course', 'book', 'tuition', 'training'],
      utilities: ['utility', 'electricity', 'water', 'gas', 'internet', 'phone'],
      other: ['other', 'misc', 'miscellaneous']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        parsed.category = category;
        break;
      }
    }

    // Extract description (remove amount and common words)
    let description = text;
    if (amountMatch) {
      description = description.replace(amountMatch[0], '').trim();
    }
    
    // Remove common words that don't add value to description
    const commonWords = ['dollars', 'dollar', 'spent', 'paid', 'cost', 'price', 'for', 'on', 'the', 'a', 'an'];
    commonWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      description = description.replace(regex, '');
    });
    
    parsed.description = description.trim() || 'Voice transaction';

    return parsed;
  };

  const handleProcessVoice = () => {
    if (!transcript.trim()) {
      setError('Please speak something first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const parsed = parseVoiceInput(transcript);
      setParsedData(parsed);
    } catch (error) {
      setError('Failed to parse voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransaction = () => {
    if (parsedData) {
      addTransaction(parsedData);
      navigate('/');
    }
  };

  const handleEditParsedData = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📝';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Other';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Input</h1>
          <p className="text-gray-600 mt-1">Add transactions using your voice</p>
        </div>
      </div>

      {/* Browser Support Status */}
      {browserSupport && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {browserSupport.supported ? (
                <CheckCircle className="h-5 w-5 text-success-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-danger-600" />
              )}
              <span className="text-sm">
                Browser Support: {browserSupport.supported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
            
            {microphonePermission && (
              <div className="flex items-center space-x-3">
                {microphonePermission === 'granted' ? (
                  <CheckCircle className="h-5 w-5 text-success-600" />
                ) : microphonePermission === 'denied' ? (
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                ) : (
                  <Info className="h-5 w-5 text-warning-600" />
                )}
                <span className="text-sm">
                  Microphone Permission: {microphonePermission}
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-info-600" />
              <span className="text-sm">
                Protocol: {window.location.protocol === 'https:' ? 'HTTPS (Secure)' : 'HTTP (Development)'}
              </span>
            </div>
            
            {/* Test Microphone Button */}
            <button
              onClick={() => setShowMicrophoneTest(true)}
              className="mt-3 w-full py-2 px-4 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Test Microphone</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Recognition Section */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Recognition</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-danger-600" />
              <span className="text-danger-700">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-6 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-danger-500 hover:bg-danger-600 text-white animate-pulse'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
              disabled={!recognitionRef.current}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isListening ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
                  Listening... Speak now
                </span>
              ) : (
                'Click the microphone to start recording'
              )}
            </p>
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What you said:
            </label>
            <div className="p-3 bg-gray-50 rounded-lg min-h-[60px] border">
              {transcript || 'Your speech will appear here...'}
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcessVoice}
            disabled={!transcript.trim() || isProcessing}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Volume2 className="h-4 w-4" />
            <span>{isProcessing ? 'Processing...' : 'Process Voice Input'}</span>
          </button>
        </div>
      </div>

      {/* Parsed Data Section */}
      {parsedData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parsed Transaction</h3>
          
          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={parsedData.type}
                onChange={(e) => handleEditParsedData('type', e.target.value)}
                className="input-field"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={parsedData.description}
                onChange={(e) => handleEditParsedData('description', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={parsedData.amount}
                onChange={(e) => handleEditParsedData('amount', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                className="input-field"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={parsedData.category}
                onChange={(e) => handleEditParsedData('category', e.target.value)}
                className="input-field"
              >
                {categories
                  .filter(cat => cat.id !== 'income' || parsedData.type === 'income')
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={parsedData.date}
                onChange={(e) => handleEditParsedData('date', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Save Button */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSaveTransaction}
                className="btn-primary flex items-center space-x-2 flex-1 justify-center"
              >
                <Save className="h-4 w-4" />
                <span>Save Transaction</span>
              </button>
              <button
                onClick={() => {
                  setParsedData(null);
                  setTranscript('');
                }}
                className="btn-secondary flex-1"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Section */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">If voice input is not working:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-primary-600">1.</span>
                <span>Make sure you're using a supported browser (Chrome, Edge, Safari)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600">2.</span>
                <span>Allow microphone access when prompted by your browser</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600">3.</span>
                <span>Check that your microphone is working and not muted</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600">4.</span>
                <span>Speak clearly and at a normal volume</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600">5.</span>
                <span>Try refreshing the page if issues persist</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Browser Settings:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Chrome: Settings → Privacy and security → Site Settings → Microphone</li>
              <li>• Edge: Settings → Cookies and site permissions → Microphone</li>
              <li>• Safari: Safari → Preferences → Websites → Microphone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Voice Commands Help */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Command Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Expenses:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• "Spent $25 on lunch"</li>
              <li>• "Paid $50 for gas"</li>
              <li>• "Movie tickets cost $30"</li>
              <li>• "Shopping $120 for clothes"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Income:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• "Received $2000 salary"</li>
              <li>• "Earned $500 from freelance"</li>
              <li>• "Payment of $150 received"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Debug Information (for developers) */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
        </div>
        
        {showDebug && (
          <div className="space-y-3 text-sm">
            <div>
              <strong>Browser Support:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                {JSON.stringify(browserSupport, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Microphone Permission:</strong> {microphonePermission}
            </div>
            <div>
              <strong>Recognition Initialized:</strong> {debugInfo.recognitionInitialized ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Current Error:</strong> {error || 'None'}
            </div>
            <div>
              <strong>User Agent:</strong> {navigator.userAgent}
            </div>
          </div>
        )}
      </div>

      {/* Microphone Test Modal */}
      {showMicrophoneTest && (
        <MicrophoneTest onClose={() => setShowMicrophoneTest(false)} />
      )}
    </div>
  );
};

export default VoiceInput; 