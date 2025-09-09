import { writable } from "svelte/store";

export interface InputState {
	heldKeys: Set<string>;
	heldMouseButtons: Set<number>;
	lastKeyPressTime: Map<string, number>;
	lastMouseClickTime: Map<number, number>;
}

function createInputController() {
	const { subscribe, update } = writable<InputState>({
		heldKeys: new Set(),
		heldMouseButtons: new Set(),
		lastKeyPressTime: new Map(),
		lastMouseClickTime: new Map(),
	});

	return {
		subscribe,

		// Key event handlers
		keyDown: (key: string) => {
			update((state) => {
				const newState = { ...state };
				newState.heldKeys = new Set(state.heldKeys);
				newState.heldKeys.add(key.toLowerCase());
				newState.lastKeyPressTime = new Map(state.lastKeyPressTime);
				newState.lastKeyPressTime.set(key.toLowerCase(), Date.now());
				return newState;
			});
		},

		keyUp: (key: string) => {
			update((state) => {
				const newState = { ...state };
				newState.heldKeys = new Set(state.heldKeys);
				newState.heldKeys.delete(key.toLowerCase());
				return newState;
			});
		},

		// Mouse event handlers
		mouseDown: (button: number) => {
			update((state) => {
				const newState = { ...state };
				newState.heldMouseButtons = new Set(state.heldMouseButtons);
				newState.heldMouseButtons.add(button);
				newState.lastMouseClickTime = new Map(state.lastMouseClickTime);
				newState.lastMouseClickTime.set(button, Date.now());
				return newState;
			});
		},

		mouseUp: (button: number) => {
			update((state) => {
				const newState = { ...state };
				newState.heldMouseButtons = new Set(state.heldMouseButtons);
				newState.heldMouseButtons.delete(button);
				return newState;
			});
		},

		// Check if a key press should be allowed (not held down)
		isKeyPressAllowed: (key: string): boolean => {
			let currentState: InputState;
			const unsubscribe = subscribe((state) => (currentState = state));
			unsubscribe();

			const normalizedKey = key.toLowerCase();
			const isHeld = currentState!.heldKeys.has(normalizedKey);

			// Only allow if key is NOT currently held down
			// This completely blocks held key spam while allowing rapid individual presses
			return !isHeld;
		},

		// Check if a mouse click should be allowed (not held down)
		isMouseClickAllowed: (button: number): boolean => {
			let currentState: InputState;
			const unsubscribe = subscribe((state) => (currentState = state));
			unsubscribe();

			const isHeld = currentState!.heldMouseButtons.has(button);

			// Only allow if mouse button is NOT currently held down
			// This completely blocks held mouse button spam while allowing rapid individual clicks
			return !isHeld;
		},
	};
}

export const inputController = createInputController();
