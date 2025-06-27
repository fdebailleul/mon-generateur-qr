import React, { useState, useEffect, useRef } from 'react';
import { Link, MessageSquare, User, Download, Copy, Check, LucideIcon } from 'lucide-react';

// Déclaration globale pour la bibliothèque QRious chargée dynamiquement
declare global {
  interface Window {
    QRious: any;
  }
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
}

interface Tab {
  id: 'url' | 'text' | 'contact';
  label: string;
  icon: LucideIcon;
}

const QRCodeGenerator: React.FC = () => {
  // État global
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'contact'>('url');
  const [qrData, setQrData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // États des formulaires
  const [urlInput, setUrlInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  /* --------------------------------------------------
   * Utilitaires QR Code
   * -------------------------------------------------- */
  const generateQRCode = async (text: string): Promise<void> => {
    if (!text.trim()) {
      qrContainerRef.current && (qrContainerRef.current.innerHTML = '');
      return;
    }
    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => createQR(text);
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (err) {
      console.error('Erreur chargement QRious', err);
      generateFallbackQR(text);
    }
  };

  const createQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    try {
      qrContainerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);

      /* eslint-disable-next-line */
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: 'white',
        foreground: 'black',
        level: 'M'
      });

      canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
      canvas.style.maxWidth = '300px';
      canvas.style.height = 'auto';
    } catch (err) {
      console.error('Erreur création QR', err);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';

    const img = document.createElement('img');
    const encoded = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encoded}&choe=UTF-8`;
    img.alt = 'QR Code généré';
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';

    img.onerror = () => {
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&format=png&margin=10`;
    };

    qrContainerRef.current.appendChild(img);
  };

  /* --------------------------------------------------
   * Transformations de données
   * -------------------------------------------------- */
  const formatUrl = (url: string): string => {
    if (!url.trim()) return '';
    if (!/^https?:\/\//i.test(url)) return 'https://' + url;
    return url;
  };

  const generateVCard = (c: ContactInfo): string =>
    [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${c.firstName} ${c.lastName}`,
      `N:${c.lastName};${c.firstName};;;`,
      `ORG:${c.organization}`,
      `TEL:${c.phone}`,
      `EMAIL:${c.email}`,
      `URL:${c.url}`,
      'END:VCARD'
    ].join('\n');

  /* --------------------------------------------------
   * Effets
   * -------------------------------------------------- */
  useEffect(() => {
    let data = '';
    if (activeTab === 'url') data = formatUrl(urlInput);
    if (activeTab === 'text') data = textInput;
    if (activeTab === 'contact' && (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email)) {
      data = generateVCard(contactInfo);
    }
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  /* --------------------------------------------------
   * Actions utilisateur
   * -------------------------------------------------- */
  const downloadQRCode = (): void => {
    if (!qrData) return;
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');

    const link = document.createElement('a');
    link.download = `qr-code-${activeTab}.png`;
    link.href = canvas ? (canvas as HTMLCanvasElement).toDataURL() : (img as HTMLImageElement).src;
    link.click();
  };

  const copyToClipboard = async (): Promise<void> => {
    if (!qrData) return;
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copie échouée', err);
    }
  };

  const resetForm = (): void => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setQrData('');
    qrContainerRef.current && (qrContainerRef.current.innerHTML = '');
  };

  /* --------------------------------------------------
   * Configuration des onglets
   * -------------------------------------------------- */
  const tabs: Tab[] = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Texte', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  /* --------------------------------------------------
   * Rendu
   * -------------------------------------------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Générateur de QR Code</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1 px-3 py-1 rounded ${activeTab === id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Forms */}
      {activeTab === 'url' && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">URL</label>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://exemple.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {activeTab === 'text' && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Texte</label>
          <textarea
            rows={4}
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <input
            placeholder="Prénom"
            value={contactInfo.firstName}
            onChange={e => setContactInfo({ ...contactInfo, firstName: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Nom"
            value={contactInfo.lastName}
            onChange={e => setContactInfo({ ...contactInfo, lastName: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Téléphone"
            value={contactInfo.phone}
            onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
            className="border rounded px-3 py-2 col-span-2"
          />
          <input
            placeholder="Email"
            value={contactInfo.email}
            onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
            className="border rounded px-3 py-2 col-span-2"
          />
          <input
            placeholder="Organisation"
            value={contactInfo.organization}
            onChange={e => setContactInfo({ ...contactInfo, organization: e.target.value })}
            className="border rounded px-3 py-2 col-span-2"
          />
          <input
            placeholder="Site Web"
            value={contactInfo.url}
            onChange={e => setContactInfo({ ...contactInfo, url: e.target.value })}
            className="border rounded px-3 py-2 col-span-2"
          />
        </div>
      )}

      {/* QR Code */}
      <div ref={qrContainerRef} className="flex justify-center mb-4" />

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button onClick={downloadQRCode} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded">
          <Download className="h-4 w-4" />
          Télécharger
        </button>
        <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copié!' : 'Copier les données'}
        </button>
        <button onClick={resetForm} className="px-3 py-2 bg-gray-300 rounded">Effacer</button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
