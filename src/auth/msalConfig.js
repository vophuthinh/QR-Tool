import { PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || "";
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || "";

if (!clientId || !tenantId) {
  console.warn(
    "⚠️ MSAL chưa được cấu hình. Vui lòng thêm VITE_AZURE_CLIENT_ID và VITE_AZURE_TENANT_ID vào file .env"
  );
}

const getRedirectUri = () => {
  return window.location.origin;
};

const msalConfig = {
  auth: {
    clientId: clientId,
    authority: tenantId 
      ? `https://login.microsoftonline.com/${tenantId}` 
      : "https://login.microsoftonline.com/common",
    redirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().catch((error) => {
  console.error("MSAL initialization error:", error);
  console.warn("App will still work, but SSO login may not function properly.");
});
