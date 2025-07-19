import React, { useState, useRef, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Save, RotateCcw, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

const OCRScanner = () => {
  const { categories, addTransaction } = useTransactions();
  const navigate = useNavigate();
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!capturedImage) {
      setError('Please capture or upload an image first');
      return;
    }

    setIsProcessing(true);
    setError('');
    setExtractedText('');

    try {
      const result = await Tesseract.recognize(
        capturedImage,
        'eng',
        {
          logger: m => console.log(m)
        }
      );

      const text = result.data.text;
      setExtractedText(text);
      
      // Parse the extracted text
      const parsed = parseReceiptText(text);
      setParsedData(parsed);
      
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseReceiptText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let parsed = {
      type: 'expense',
      description: 'Receipt scan',
      amount: 0,
      category: 'other',
      date: new Date().toISOString().split('T')[0]
    };

    // Look for total amount patterns
    const totalPatterns = [
      /total.*?\$?(\d+\.?\d*)/i,
      /amount.*?\$?(\d+\.?\d*)/i,
      /sum.*?\$?(\d+\.?\d*)/i,
      /due.*?\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/g
    ];

    let foundAmount = false;
    for (const pattern of totalPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        // Get the last match (usually the total)
        const amount = parseFloat(matches[matches.length - 1]);
        if (amount > 0 && amount < 10000) { // Reasonable amount range
          parsed.amount = amount;
          foundAmount = true;
          break;
        }
      }
    }

    // Look for date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let year = parseInt(match[3]);
        if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
        
        const month = parseInt(match[2]) - 1; // Month is 0-indexed
        const day = parseInt(match[1]);
        
        if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month, day);
          if (date.getTime() > 0) {
            parsed.date = date.toISOString().split('T')[0];
            break;
          }
        }
      }
    }

    // Try to identify category from text
    const lowerText = text.toLowerCase();
    const categoryKeywords = {
      food: ['restaurant', 'cafe', 'diner', 'pizza', 'burger', 'coffee', 'food', 'meal'],
      transport: ['gas', 'fuel', 'uber', 'taxi', 'parking', 'transport'],
      shopping: ['store', 'shop', 'mall', 'retail', 'clothing', 'shoes'],
      health: ['pharmacy', 'medical', 'drug', 'health', 'doctor'],
      entertainment: ['movie', 'cinema', 'theater', 'concert', 'game'],
      utilities: ['electric', 'water', 'gas', 'internet', 'phone', 'utility']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        parsed.category = category;
        break;
      }
    }

    // Try to extract description from first few lines
    const firstLines = lines.slice(0, 3);
    for (const line of firstLines) {
      if (line.length > 3 && line.length < 50 && !line.match(/^\d/)) {
        parsed.description = line;
        break;
      }
    }

    return parsed;
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

  const resetScanner = () => {
    setCapturedImage(null);
    setExtractedText('');
    setParsedData(null);
    setError('');
    setShowCamera(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scan Bill</h1>
          <p className="text-gray-600 mt-1">Extract transaction details from receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Capture Section */}
        <div className="space-y-6">
          {/* Camera/Upload Controls */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capture Image</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                  <span className="text-danger-700">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Camera Button */}
              <button
                onClick={() => setShowCamera(true)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Use Camera</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Reset Button */}
              <button
                onClick={resetScanner}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Camera View */}
          {showCamera && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera</h3>
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg"
                />
                <button
                  onClick={capture}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Camera className="h-6 w-6 text-gray-700" />
                </button>
              </div>
            </div>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Image</h3>
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full rounded-lg border"
              />
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full btn-primary mt-4 flex items-center justify-center space-x-2"
              >
                <span>{isProcessing ? 'Processing...' : 'Extract Text'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Extracted Text */}
          {extractedText && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Text</h3>
              <div className="p-3 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText}</pre>
              </div>
            </div>
          )}

          {/* Parsed Transaction */}
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
                    onClick={() => setParsedData(null)}
                    className="btn-secondary flex-1"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Ensure good lighting when taking photos</li>
              <li>• Hold the camera steady and parallel to the receipt</li>
              <li>• Make sure the total amount is clearly visible</li>
              <li>• Avoid shadows and glare on the receipt</li>
              <li>• Use high-resolution images for better accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRScanner; 