import React, { useState, useEffect } from 'react';
import { loadSimulationState, saveSimulationState } from './services/memoryService';
import { SimulationState } from './types';

function App() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading Simulation...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
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
      <p style={{ color: '#666', fontSize: '0.8em' }}>
        Changes are automatically saved to the backend.
      </p>
    </div>
  );
}

export default App;
