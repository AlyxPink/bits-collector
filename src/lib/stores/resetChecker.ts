// resetChecker.ts - Must have NO imports to avoid circular dependencies
// This module runs the reset check before any stores can initialize

if (typeof window !== "undefined") {
	const needsReset = localStorage.getItem("needsReset");
	
	if (needsReset === "true") {
		console.log("🔄 Game reset initiated - clearing localStorage");
		localStorage.clear();
	}
}