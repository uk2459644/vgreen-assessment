import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Determine host: automatically detect Metro server IP when running on Android/device,
// or fallback to localhost (works with adb reverse tcp:9042 tcp:9042 or iOS simulator).
let scriptHostname = 'localhost';
if (__DEV__) {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const address = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
    if (address && address !== '127.0.0.1' && address !== 'localhost') {
      scriptHostname = address;
    }
  }
}

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'TribeGreen',
    host: scriptHostname,
  })
  .useReactNative({
    asyncStorage: true, // track AsyncStorage calls
    networking: {
      ignoreUrls: /symbolicate/, // don't log internal React Native symbolicate calls
    },
    editor: false,
    errors: { veto: () => false },
    overlay: false,
  })
  .connect();

// Clear on every app reload
Reactotron.clear();

// Attach to global console for convenient debugging: console.tron.log('hello', data)
console.tron = Reactotron;

export default reactotron;

