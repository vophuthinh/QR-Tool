// src/auth/msalConfig.js
import { PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || "";
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || "";

const msalConfig = {
  auth: {
    clientId: clientId,
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin, // http://localhost:5173 hoặc domain thật
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Khởi tạo MSAL instance - chạy async nhưng không block render
msalInstance.initialize().catch((error) => {
  console.warn("MSAL initialization error (app will still work, but SSO login may not function):", error);
});

// Warning nếu chưa config
if (!clientId || !tenantId) {
  console.warn(
    "⚠️ MSAL chưa được cấu hình. Vui lòng thêm VITE_AZURE_CLIENT_ID và VITE_AZURE_TENANT_ID vào file .env"
  );
}

