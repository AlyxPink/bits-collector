export type ColorVariant =
	| "red"
	| "green"
	| "blue"
	| "purple"
	| "yellow"
	| "white"
	| "gray"
	| "orange"
	| "cyan"
	| "magenta"
	| "lime"
	| "crimson"
	| "emerald"
	| "sapphire";

export interface ColorTheme {
	border: string;
	text: string;
	bg: string;
	shadowColor: string;
}

export const colorThemes: Record<ColorVariant, ColorTheme> = {
	red: {
		border: "border-red-500",
		text: "text-red-400",
		bg: "bg-red-500/10",
		shadowColor: "239, 68, 68",
	},
	green: {
		border: "border-green-500",
		text: "text-green-400",
		bg: "bg-green-500/10",
		shadowColor: "34, 197, 94",
	},
	blue: {
		border: "border-blue-500",
		text: "text-blue-400",
		bg: "bg-blue-500/10",
		shadowColor: "59, 130, 246",
	},
	purple: {
		border: "border-purple-500",
		text: "text-purple-400",
		bg: "bg-purple-500/10",
		shadowColor: "147, 51, 234",
	},
	yellow: {
		border: "border-yellow-500",
		text: "text-yellow-400",
		bg: "bg-yellow-500/10",
		shadowColor: "234, 179, 8",
	},
	white: {
		border: "border-white",
		text: "text-white",
		bg: "bg-white/10",
		shadowColor: "255, 255, 255",
	},
	gray: {
		border: "border-gray-500",
		text: "text-gray-400",
		bg: "bg-gray-500/10",
		shadowColor: "107, 114, 128",
	},
	orange: {
		border: "border-orange-500",
		text: "text-orange-400",
		bg: "bg-orange-500/10",
		shadowColor: "251, 146, 60",
	},
	cyan: {
		border: "border-cyan-500",
		text: "text-cyan-400",
		bg: "bg-cyan-500/10",
		shadowColor: "34, 211, 238",
	},
	magenta: {
		border: "border-pink-500",
		text: "text-pink-400",
		bg: "bg-pink-500/10",
		shadowColor: "236, 72, 153",
	},
	lime: {
		border: "border-lime-500",
		text: "text-lime-400",
		bg: "bg-lime-500/10",
		shadowColor: "132, 204, 22",
	},
	crimson: {
		border: "border-red-700",
		text: "text-red-600",
		bg: "bg-red-700/10",
		shadowColor: "185, 28, 28",
	},
	emerald: {
		border: "border-emerald-600",
		text: "text-emerald-500",
		bg: "bg-emerald-600/10",
		shadowColor: "5, 150, 105",
	},
	sapphire: {
		border: "border-blue-700",
		text: "text-blue-600",
		bg: "bg-blue-700/10",
		shadowColor: "29, 78, 216",
	},
};

export function getColorTheme(variant: ColorVariant): ColorTheme {
	return colorThemes[variant];
}

export function getColorClasses(variant: ColorVariant): string {
	const theme = getColorTheme(variant);
	return `${theme.border} ${theme.text} ${theme.bg}`;
}

export function getShadowStyle(
	variant: ColorVariant,
	intensity: number = 0.3,
): string {
	const theme = getColorTheme(variant);
	return `box-shadow: 0 0 15px rgba(${theme.shadowColor}, ${intensity})`;
}

export function getHoverShadowStyle(
	variant: ColorVariant,
	intensity: number = 0.5,
): string {
	const theme = getColorTheme(variant);
	return `box-shadow: 0 0 25px rgba(${theme.shadowColor}, ${intensity})`;
}

// Utility for converting upgrade color to ColorVariant
export function upgradeColorToVariant(
	color: "red" | "green" | "blue" | "random",
): ColorVariant {
	if (color === "random") return "purple";
	return color;
}
