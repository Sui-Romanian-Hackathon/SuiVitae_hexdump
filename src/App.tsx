import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Browse from "./pages/Browse";
import Learning from "./pages/Learning";
import Certifications from "./pages/Certifications";
import CertificateView from "./pages/CertificateView";
import NotFound from "./pages/NotFound";

// 🔌 SUI BLOCKCHAIN IMPORTS
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { NETWORK } from "@/constants";

// 🔐 GOOGLE OAUTH
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

// Google OAuth Client ID - Replace with your own from Google Cloud Console
// Get one at: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID_HERE";

// Configure Sui Network
const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 🔐 GOOGLE OAUTH PROVIDER */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {/* 🛡️ WRAP APP IN SUI PROVIDERS */}
    <SuiClientProvider networks={networks} defaultNetwork={NETWORK}>
      <WalletProvider autoConnect>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Browse />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/certifications" element={<Certifications />} />
                <Route path="/certificate/:certId" element={<CertificateView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </SuiClientProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;