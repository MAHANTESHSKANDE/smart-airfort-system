import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [flights, setFlights] = useState([]);
  const [runway, setRunway] = useState({});
  const [congestion, setCongestion] = useState({});
  const [stats, setStats] = useState({});
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: "Hi! 👋 Welcome to Smart Airport Dashboard. Ask me about flights, runways, or congestion!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

  // Real-time data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsConnected(true);
        const [flightsRes, runwayRes, congestionRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE}/flights`),
          axios.get(`${API_BASE}/runway`),
          axios.get(`${API_BASE}/congestion`),
          axios.get(`${API_BASE}/stats`)
        ]);

        setFlights(flightsRes.data);
        setRunway(runwayRes.data);
        setCongestion(congestionRes.data);
        setStats(statsRes.data);
      } catch (error) {
        setIsConnected(false);
        console.error('API Error:', error);
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const tempInput = chatInput;
    setChatInput('');

    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: tempInput });
      setChatMessages(prev => [...prev, { type: 'bot', text: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again!"
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time': return 'badge-on-time';
      case 'delayed': return 'badge-delayed';
      case 'boarding': return 'badge-boarding';
      case 'landed': return 'badge-landed';
      default: return 'badge-on-time';
    }
  };

  const getCongestionClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'congestion-low';
      case 'medium': return 'congestion-medium';
      case 'high': return 'congestion-high';
      case 'critical': return 'congestion-critical';
      default: return 'congestion-low';
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="logo">✈️ Smart Airport</div>
          <ul className="nav-links">
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#chat">Chat</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>

      {/* Connection Status */}
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 LIVE' : '🔴 DISCONNECTED'}
      </div>

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>Real-Time Airport Dashboard</h1>
          <p>Live flight tracking, runway status, and congestion monitoring</p>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid" id="dashboard">
          {/* Flights Card */}
          <div className="card">
            <h2>🛫 Live Flights</h2>
            {flights.length > 0 ? (
              flights.map((flight) => (
                <div key={flight.id} className={`flight-item status-${flight.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flight-info">
                    <h4>{flight.flight}</h4>
                    <div className="flight-meta">
                      Gate: {flight.gate || 'N/A'} | ETA: {flight.eta || 'N/A'} | {flight.destination || 'N/A'}
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(flight.status)}`}>
                    {flight.status || 'Unknown'}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-data">No flights data available</div>
            )}
          </div>

          {/* Runway Status */}
          <div className="card">
            <h2>🛬 Runway Status</h2>
            <div className="runway-info">
              <div className="status-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${runway.status ? getStatusColor(runway.status) : 'badge-on-time'}`}>
                  {runway.status || 'Available'}
                </span>
              </div>
              <div className="status-item">
                <strong>Wind:</strong> {runway.wind || 'N/A'}
              </div>
              <div className="status-item">
                <strong>Visibility:</strong> {runway.visibility || 'N/A'}
              </div>
            </div>
          </div>

          {/* Congestion Card */}
          <div className="card">
            <h2>🚦 Congestion Level</h2>
            <div className={`congestion-meter ${getCongestionClass(congestion.level)}`}>
              <div className="congestion-level">
                {congestion.level || 'Low'}
              </div>
              <div className="congestion-details">
                <div><strong>Wait Time:</strong> {congestion.waitTime || 'N/A'}</div>
                <div><strong>Queue:</strong> {congestion.queueLength || 0} aircraft</div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card">
            <h2>📊 Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalFlights || 0}</div>
                <div className="stat-label">Total Flights</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.delayedFlights || 0}</div>
                <div className="stat-label">Delayed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.onTimeFlights || 0}</div>
                <div className="stat-label">On Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <section className="chat-section" id="chat">
          <div className="card">
            <h2>💬 AI Assistant</h2>
            <div className="chat-container">
              <div className="messages">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about flights, runways, or congestion..."
                  className="chat-input"
                />
                <button onClick={sendMessage} className="send-button">Send</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;