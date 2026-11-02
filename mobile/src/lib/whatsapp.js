import { Alert, Linking } from 'react-native';
import { WHATSAPP_NUMBER } from '../config';

// Opens WhatsApp with the message already typed (same wa.me link as the website).
// An https link needs no Android 11 "queries" entry; it opens WhatsApp or the browser.
export async function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open WhatsApp', 'Please make sure WhatsApp or a web browser is installed.');
  }
}
