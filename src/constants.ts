export const NETWORK = process.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = process.env.VITE_MODULE_ADDRESS;
export const CREATOR_ADDRESS = process.env.VITE_COLLECTION_CREATOR_ADDRESS;
// export const COLLECTION_ADDRESS = process.env.VITE_COLLECTION_ADDRESS;
export const IS_DEV = Boolean(process.env.DEV);
export const IS_PROD = Boolean(process.env.PROD);
export const APTOS_API_KEY = process.env.VITE_APTOS_API_KEY;
