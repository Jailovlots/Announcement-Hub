import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Centered configuration for the API base URL.
 * Automatically switches between the live Render backend and the local dev server.
 */

// The Render backend URL
export const RENDER_API_URL = "https://announcement-hub-ywiu.onrender.com";

// Local development URL detection
const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
const LOCAL_API_URL = Platform.OS === "web" || !debuggerHost
  ? "http://localhost:5001"
  : `http://${debuggerHost}:5001`;

/**
 * The base URL for all API requests.
 * Uses the local URL in development mode and the Render URL in production builds.
 */
export const API_BASE = __DEV__ ? LOCAL_API_URL : RENDER_API_URL;

console.log(`[API Config] Using base URL: ${API_BASE}`);
