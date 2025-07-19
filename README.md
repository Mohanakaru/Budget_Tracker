# Smart Budget Tracking App

A comprehensive financial management application with AI-powered insights, voice recognition, and OCR capabilities for automatic receipt scanning.

## 🚀 Features

### Core Budget Tracking
- **Manual Transaction Entry**: Add income and expenses with detailed categorization
- **Multiple Categories**: Food, Transportation, Entertainment, Shopping, Healthcare, Education, Utilities, and more
- **Budget Limits**: Set spending limits for each category with visual progress tracking
- **Transaction History**: Complete history with search and filtering capabilities

### Voice Recognition
- **Hands-free Input**: Add transactions using voice commands
- **Smart Parsing**: Automatically extracts amount, category, and description from speech
- **Voice Command Examples**:
  - "Spent $25 on lunch"
  - "Paid $50 for gas"
  - "Received $2000 salary"
  - "Movie tickets cost $30"

### OCR Receipt Scanning
- **Camera Integration**: Capture receipts using device camera
- **Image Upload**: Upload existing receipt images
- **Automatic Data Extraction**: Uses Tesseract.js to extract text and parse transaction details
- **Smart Category Detection**: Automatically categorizes transactions based on receipt content

### AI-Powered Insights
- **Spending Pattern Analysis**: Identifies trends and anomalies in your spending
- **Budget Overspending Alerts**: Real-time notifications when you exceed category limits
- **Personalized Recommendations**: AI-generated suggestions for better financial management
- **Spending Forecasts**: Predicts future spending based on historical patterns
- **Financial Health Score**: Comprehensive analysis of your financial habits

### Data Visualization
- **Interactive Charts**: Bar charts, pie charts, and area charts for spending analysis
- **Trend Analysis**: 6-month spending and income trends
- **Budget vs Actual**: Visual comparison of planned vs actual spending
- **Category Breakdown**: Detailed spending distribution across categories

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks and Context API
- **Styling**: Tailwind CSS for modern, responsive design
- **Charts**: Recharts for data visualization
- **Voice Recognition**: Web Speech API
- **OCR**: Tesseract.js for text extraction
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-budget-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Dashboard Overview**: View your financial summary, recent transactions, and AI insights
2. **Add Transactions**: Use the "Add Transaction" button for manual entry
3. **Voice Input**: Navigate to "Voice Input" for hands-free transaction recording
4. **Scan Receipts**: Use "Scan Bill" to extract data from receipts automatically
5. **AI Insights**: Check "AI Insights" for personalized financial recommendations

### Adding Transactions

#### Manual Entry
1. Click "Add Transaction" in the navigation
2. Select transaction type (Income/Expense)
3. Enter description, amount, and category
4. Choose date (defaults to today)
5. Click "Save Transaction"

#### Voice Input
1. Navigate to "Voice Input"
2. Check the system status indicators for browser support and microphone permissions
3. Click "Test Microphone" if needed to verify microphone functionality
4. Click the microphone button to start recording
5. Speak your transaction clearly (e.g., "Spent $25 on lunch")
6. Review the parsed data
7. Edit if needed and save

**Voice Input Troubleshooting:**
- **Browser Support**: Use Chrome, Edge, or Safari for best compatibility
- **Microphone Permissions**: Allow microphone access when prompted
- **HTTPS Required**: Voice recognition requires HTTPS in production
- **Clear Speech**: Speak clearly and at normal volume
- **Test Microphone**: Use the built-in microphone test to verify functionality

#### Receipt Scanning
1. Go to "Scan Bill"
2. Use camera or upload image
3. Click "Extract Text" to process
4. Review extracted data
5. Edit and save transaction

### AI Insights Features

#### Spending Analysis
- **Overspending Alerts**: Get notified when you exceed budget limits
- **Trend Detection**: Identify increasing or decreasing spending patterns
- **Category Analysis**: See which categories consume most of your budget

#### Smart Recommendations
- **High Priority**: Critical budget overruns requiring immediate attention
- **Medium Priority**: Suggestions for improving spending habits
- **Low Priority**: General financial wellness tips

#### Forecasting
- **Next Month Prediction**: AI estimates future spending based on patterns
- **Trend Analysis**: Shows if spending is increasing, decreasing, or stable
- **Confidence Levels**: Indicates reliability of predictions

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended for voice recognition)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

**Note**: Voice recognition requires HTTPS in production environments.

## 🔧 Troubleshooting

### Voice Input Issues
If voice input is not working:

1. **Check Browser Compatibility**
   - Use Chrome, Edge, or Safari
   - Ensure you're using a recent browser version

2. **Microphone Permissions**
   - Allow microphone access when prompted
   - Check browser settings if permission was denied
   - Chrome: Settings → Privacy and security → Site Settings → Microphone
   - Edge: Settings → Cookies and site permissions → Microphone
   - Safari: Safari → Preferences → Websites → Microphone

3. **HTTPS Requirement**
   - Voice recognition requires HTTPS in production
   - Development mode (localhost) works with HTTP

4. **Microphone Hardware**
   - Ensure microphone is not muted
   - Check system microphone settings
   - Try the built-in microphone test in the Voice Input page

5. **Clear Speech**
   - Speak clearly and at normal volume
   - Minimize background noise
   - Use simple, clear phrases

### Common Error Messages
- **"Speech recognition is not supported"**: Use a supported browser
- **"Microphone access denied"**: Allow microphone permissions
- **"No speech detected"**: Speak more clearly or check microphone
- **"Network error"**: Check internet connection

## 🔧 Configuration

### Budget Limits
Default budget limits are set for each category:
- Food & Dining: $500
- Transportation: $300
- Entertainment: $200
- Shopping: $400
- Healthcare: $300
- Education: $500
- Utilities: $200
- Other: $300

### Categories
The app includes 9 predefined categories with icons and colors:
- 🍽️ Food & Dining
- 🚗 Transportation
- 🎬 Entertainment
- 🛍️ Shopping
- 🏥 Healthcare
- 📚 Education
- ⚡ Utilities
- 💰 Income
- 📝 Other

## 💾 Data Storage

- **Local Storage**: All transaction data is stored locally in the browser
- **No Server Required**: Works completely offline
- **Data Persistence**: Transactions persist between browser sessions
- **Privacy**: Your financial data never leaves your device

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository to Netlify or Vercel
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically on git push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tesseract.js**: For OCR capabilities
- **Recharts**: For beautiful data visualizations
- **Tailwind CSS**: For modern styling
- **Lucide React**: For consistent iconography
- **Web Speech API**: For voice recognition

**Smart Budget Tracker** - Take control of your finances with AI-powered insights! 💰📊 
