import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_APP_LOGICAL_NAME": "tat-made-in-normandie", "VITE_FIREBASE_API_KEY": "AIzaSyDcvxmA-TWPSvXuXOJceiiS-gpuE4d0ZnE", "VITE_FIREBASE_APP_ID": "1:116427088828:web:614ea24f006431d4d581b9", "VITE_FIREBASE_AUTH_DOMAIN": "tatmadeinnormandie.web.app", "VITE_FIREBASE_MEASUREMENT_ID": "G-Z58ZWH97Z2", "VITE_FIREBASE_MESSAGING_SENDER_ID": "116427088828", "VITE_FIREBASE_PROJECT_ID": "tatmadeinnormandie", "VITE_FIREBASE_STORAGE_BUCKET": "tatmadeinnormandie.firebasestorage.app", "VITE_RECAPTCHA_SITE_KEY": "6Lc7OXAsAAAAAHz6Lwl5wWlhEP31TN_hOsWBhWde", "VITE_STRIPE_PUBLIC_KEY": "pk_test_51SugGzRdWb0VNdZqaaB2DDnQJelextDRyXEneJRDmzZ5I8wobSLp37IislepaMHoRg3k7aIvQW0NLhucum18m8y5004IFJQ1pM"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=91a80fa8"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=91a80fa8"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=91a80fa8"; const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule ? __vite__cjsImport2_reactDom_client.default : __vite__cjsImport2_reactDom_client;
import "/src/index.css";
import App from "/src/App.jsx";
import { HelmetProvider } from "/node_modules/.vite/deps/react-helmet-async.js?v=91a80fa8";
import { loadStripe } from "/node_modules/.vite/deps/@stripe_stripe-js.js?v=91a80fa8";
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Erreur : L'élément avec l'id 'root' est introuvable dans index.html. Vérifie ton fichier HTML !");
} else {
  ReactDOM.createRoot(rootElement).render(
    /* @__PURE__ */ jsxDEV(HelmetProvider, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
      fileName: "C:/Users/matth/Travail/Tous à Table/src/main.jsx",
      lineNumber: 23,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "C:/Users/matth/Travail/Tous à Table/src/main.jsx",
      lineNumber: 22,
      columnNumber: 5
    }, this)
  );
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBc0JNO0FBdEJOLE9BQU9BLFdBQVc7QUFDbEIsT0FBT0MsY0FBYztBQUNyQixPQUFPO0FBQ1AsT0FBT0MsU0FBUztBQUVoQixTQUFTQyxzQkFBc0I7QUFDL0IsU0FBU0Msa0JBQWtCO0FBSXBCLGFBQU1DLGdCQUFnQkQsV0FBV0UsWUFBWUMsSUFBSUMsc0JBQXNCO0FBRzlFLE1BQU1DLGNBQWNDLFNBQVNDLGVBQWUsTUFBTTtBQUdsRCxJQUFJLENBQUNGLGFBQWE7QUFDaEJHLFVBQVFDLE1BQU0saUdBQWlHO0FBQ2pILE9BQU87QUFFTFosV0FBU2EsV0FBV0wsV0FBVyxFQUFFTTtBQUFBQSxJQUMvQix1QkFBQyxrQkFDQyxpQ0FBQyxTQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBSSxLQUROO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FFQTtBQUFBLEVBQ0Y7QUFDRiIsIm5hbWVzIjpbIlJlYWN0IiwiUmVhY3RET00iLCJBcHAiLCJIZWxtZXRQcm92aWRlciIsImxvYWRTdHJpcGUiLCJzdHJpcGVQcm9taXNlIiwiaW1wb3J0IiwiZW52IiwiVklURV9TVFJJUEVfUFVCTElDX0tFWSIsInJvb3RFbGVtZW50IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNvbnNvbGUiLCJlcnJvciIsImNyZWF0ZVJvb3QiLCJyZW5kZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnO1xyXG5pbXBvcnQgJy4vaW5kZXguY3NzJztcclxuaW1wb3J0IEFwcCBmcm9tICcuL0FwcC5qc3gnO1xyXG5cclxuaW1wb3J0IHsgSGVsbWV0UHJvdmlkZXIgfSBmcm9tICdyZWFjdC1oZWxtZXQtYXN5bmMnO1xyXG5pbXBvcnQgeyBsb2FkU3RyaXBlIH0gZnJvbSAnQHN0cmlwZS9zdHJpcGUtanMnO1xyXG5cclxuLy8gSW5pdGlhbGlzYXRpb24gZGUgU3RyaXBlIChDbMOpIHB1YmxpcXVlIGRlcHVpcyAuZW52KVxyXG4vLyBFeHBvcnTDqSBwb3VyIHVzYWdlIGRhbnMgQ2hlY2tvdXRWaWV3IChwZXItY2hlY2tvdXQgRWxlbWVudHMgd3JhcHBlcilcclxuZXhwb3J0IGNvbnN0IHN0cmlwZVByb21pc2UgPSBsb2FkU3RyaXBlKGltcG9ydC5tZXRhLmVudi5WSVRFX1NUUklQRV9QVUJMSUNfS0VZKTtcclxuXHJcbi8vIE9uIHLDqWN1cMOocmUgbCfDqWzDqW1lbnQgXCJyb290XCIgZGUgdG9uIGZpY2hpZXIgaW5kZXguaHRtbFxyXG5jb25zdCByb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290Jyk7XHJcblxyXG4vLyBQZXRpdGUgc8OpY3VyaXTDqSA6IG9uIHbDqXJpZmllIHF1ZSBsJ8OpbMOpbWVudCBleGlzdGUgYmllbiBhdmFudCBkZSBsYW5jZXIgbGUgc2l0ZVxyXG5pZiAoIXJvb3RFbGVtZW50KSB7XHJcbiAgY29uc29sZS5lcnJvcihcIkVycmV1ciA6IEwnw6lsw6ltZW50IGF2ZWMgbCdpZCAncm9vdCcgZXN0IGludHJvdXZhYmxlIGRhbnMgaW5kZXguaHRtbC4gVsOpcmlmaWUgdG9uIGZpY2hpZXIgSFRNTCAhXCIpO1xyXG59IGVsc2Uge1xyXG4gIC8vIENlIGZpY2hpZXIgZmFpdCBsZSBsaWVuIGVudHJlIHRvbiBjb2RlIFJlYWN0IGV0IHRhIHBhZ2UgSFRNTFxyXG4gIFJlYWN0RE9NLmNyZWF0ZVJvb3Qocm9vdEVsZW1lbnQpLnJlbmRlcihcclxuICAgIDxIZWxtZXRQcm92aWRlcj5cclxuICAgICAgPEFwcCAvPlxyXG4gICAgPC9IZWxtZXRQcm92aWRlcj5cclxuICApO1xyXG59Il0sImZpbGUiOiJDOi9Vc2Vycy9tYXR0aC9UcmF2YWlsL1RvdXMgw6AgVGFibGUvc3JjL21haW4uanN4In0=