import { SimulationState } from "../types";

// Base URL resolves to current origin for Vite Proxy compatibility
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export async function saveSimulationState(state: SimulationState): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
        
    if (!response.ok) {
      console.error("Save Error:", response.statusText);
      return false;
    }
    const data = await response.json();
    return data.success || false;
  } catch (err) {
    console.error("Failed to persist memory:", err);
    return false;
  }
}

export async function loadSimulationState(): Promise<SimulationState | null> {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/state`);
    if (!resp.ok) {
      console.error("Load Error:", resp.statusText);
      return null;
    }
    const data = await resp.json();
    return data.state || null;
  } catch (err) {
    console.error("Failed to recall memory:", err);
    return null;
  }
}
