// Edit these values. There is no .env file because that needs a native library;
// plain constants keep the project simple to explain.

// Used by debug builds (npm run android).
//   - Android emulator:  http://10.0.2.2:4000/api   (10.0.2.2 = your computer's localhost)
//   - Real phone over USB: run `adb reverse tcp:4000 tcp:4000` and use http://localhost:4000/api
const DEV_API_URL = 'https://vgreen-assessment.onrender.com/api';

// Used by release builds (the APK you submit). Must be https and include /api.
const PROD_API_URL = 'https://vgreen-assessment.onrender.com/api';

export const API_URL = (__DEV__ ? DEV_API_URL : PROD_API_URL).replace(/\/$/, '');

// WhatsApp number with country code, digits only (same number as the website).
export const WHATSAPP_NUMBER = '919999999999';
