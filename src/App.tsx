import React, { useState, useEffect } from 'react';
import { loadSimulationState, saveSimulationState } from './services/memoryService';
import { SimulationState } from './types';
import { sendMessageToMistral, ChatMessage } from './services/mistralService';
import './App.css';

function App() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load state on startup
  useEffect(() => {
    async function init() {
      const savedState = await loadSimulationState();
      if (savedState) {
        setState(savedState);
      } else {
        setState({ counter: 0, notes: "" }); // Initial default state
      }
      setLoading(false);
    }
    init();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state && !loading) {
      saveSimulationState(state);
    }
  }, [state, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: input }
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToMistral(newMessages);
      const assistantMessage = response.choices[0].message;
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to fetch response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Loading Simulation...</div>;

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mistral AI Simulator</h1>
      <div style={{ marginBottom: '20px' }}>
        <h3>Counter: {state?.counter}</h3>
        <button onClick={() => setState(prev => ({ ...prev!, counter: (prev?.counter || 0) + 1 }))}>
          Increment State
        </button>
      </div>
      <div>
        <h3>Simulation Notes:</h3>
        <textarea 
          value={state?.notes || ""} 
          onChange={(e) => setState(prev => ({ ...prev!, notes: e.target.value }))}
          rows={10}
          cols={50}
        />
      </div>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}: </strong>
            <span>{msg.content}</span>
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
      <p style={{ color: '#666', fontSize: '0.8em' }}>
        Changes are automatically saved to the backend.
      </p>
    </div>
  );
}

export default App;
