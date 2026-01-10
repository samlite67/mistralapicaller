/**
 * Memory Service for persisting simulation state
 * Handles saving and loading state from the backend database
 */

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export interface SimulationState {
	[key: string]: any;
}

/**
 * Load the simulation state from the backend
 */
export async function loadSimulationState(): Promise<SimulationState | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/state`);
		if (!response.ok) {
			console.error('Failed to load simulation state:', response.statusText);
			return null;
		}
		const data = await response.json();
		return data.state || null;
	} catch (error) {
		console.error('Error loading simulation state:', error);
		return null;
	}
}

/**
 * Save the simulation state to the backend
 */
export async function saveSimulationState(state: SimulationState): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE_URL}/state`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ state }),
		});
		if (!response.ok) {
			console.error('Failed to save simulation state:', response.statusText);
			return false;
		}
		const data = await response.json();
		return data.success || false;
	} catch (error) {
		console.error('Error saving simulation state:', error);
		return false;
	}
}
