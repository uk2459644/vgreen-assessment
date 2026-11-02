import AsyncStorage from '@react-native-async-storage/async-storage';

// "My enquiries" lives on the phone: after each successful submit the server's
// response is saved here. If storage fails the enquiry has already reached the
// server, so failures are swallowed instead of shown as an error.
const KEY = 'tg_my_enquiries_v1';
const MAX_ITEMS = 50;

export async function getMyEnquiries() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveMyEnquiry(enquiry) {
  try {
    const list = await getMyEnquiries();
    const next = [enquiry, ...list.filter((e) => e.id !== enquiry.id)].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
