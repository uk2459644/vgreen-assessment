import { WHATSAPP_NUMBER } from '@/lib/config';

// Opens WhatsApp (app on phones, WhatsApp Web on laptops) with the message already typed.
export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function WhatsAppButton({ message, children, className = 'btn btn-whatsapp' }) {
  return (
    <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
