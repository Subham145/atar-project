// src/lib/app-params.js

// Humne saara purana Base44 logic hata diya hai
export const appParams = {
    appId: "local-app",
    token: "local-token",
    fromUrl: window.location.href,
    functionsVersion: "1.0.0",
    appBaseUrl: "http://localhost:5173"
};

export const base44Config = {
    isValid: true, // Isse dashboard hamesha open rahega
    missingParams: [],
};