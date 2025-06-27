import React, { useState, useEffect, useRef } from 'react';
import { Link, MessageSquare, User, Download, Copy, Check, LucideIcon } from 'lucide-react';

// Déclaration globale pour window.QRious
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
  id: string;
  label: string;
  icon: LucideIcon;
}

const QRCodeGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('url');
  const [qrData, setQrData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // États des formulaires pour différents types
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

  // Génération de QR Code utilisant la bibliothèque QRious via CDN
  const generateQRCode = async (text: string): Promise<void> => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }
    try {
      // Charger la bibliothèque QRious dynamiquement
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la bibliothèque QR :', error);
      // Solution de repli vers l'API Google Charts
      generateFallbackQR(text);
    }
  };

  const createQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    try {
      // Effacer le QR code précédent
      qrContainerRef.current.innerHTML = '';
      // Créer l'élément canvas
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);
      // Générer le QR code
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: 'white',
        foreground: 'black',
        level: 'M'
      });
      // Styliser le canvas
      canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
      canvas.style.maxWidth = '300px';
      canvas.style.height = 'auto';
    } catch (error) {
      console.error('Erreur lors de la création du QR code :', error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    // Effacer le contenu précédent
    qrContainerRef.current.innerHTML = '';
    // Créer l'élément img pour le repli
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = 'QR Code généré';
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';
    // Ajouter la gestion d'erreur pour l'image de repli
    img.onerror = () => {
      // Si Google Charts échoue aussi, essayer l'API QR Server
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
    };
    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url: string): string => {
    if (!url.trim()) return '';
    // Ajouter le protocole s'il manque
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact: ContactInfo): string => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  useEffect(() => {
    let data = '';
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = '';
    }
    setQrData(data);
    generateQRCode(data);
    // eslint-disable-next-line
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = (): void => {
    if (!qrData) return;
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    if (canvas) {
      // Télécharger depuis le canvas
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = (canvas as HTMLCanvasElement).toDataURL();
      link.click();
    } else if (img) {
      // Télécharger depuis l'image
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = (img as HTMLImageElement).src;
      link.click();
    }
  };

  const copyToClipboard = async (): Promise<void> => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Échec de la copie du texte : ', err);
      }
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
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs: Tab[] = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Texte', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <span className="text-blue-600"><Link className="inline h-7 w-7" /></span>
        Générateur de QR Code
      </h1>
      <p className="text-gray-600 mb-4">Générez des QR codes pour les URL, texte et informations de contact.</p>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium border transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Formulaires dynamiques */}
      {activeTab === 'url' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="url-input">
            Saisir URL
          </label>
          <input
            id="url-input"
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="exemple.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            Saisissez une URL de site web. Si vous n'incluez pas http://, nous ajouterons automatiquement https://.
          </p>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="text-input">
            Saisir Texte
          </label>
          <textarea
            id="text-input"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            placeholder="Votre texte ici..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Informations de Contact</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              className="border rounded-lg px-3 py-2"
              placeholder="Prénom"
              value={contactInfo.firstName}
              onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
              autoComplete="off"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2"
              placeholder="Nom"
              value={contactInfo.lastName}
              onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
              autoComplete="off"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2"
              placeholder="Numéro de téléphone"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              autoComplete="off"
            />
            <input
              type="email"
              className="border rounded-lg px-3 py-2"
              placeholder="Adresse e-mail"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              autoComplete="off"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2"
              placeholder="Organisation"
              value={contactInfo.organization}
              onChange={(e) => setContactInfo({ ...contactInfo, organization: e.target.value })}
              autoComplete="off"
            />
            <input
              type="text"
              className="border rounded-lg px-3 py-2"
              placeholder="Site web"
              value={contactInfo.url}
              onChange={(e) => setContactInfo({ ...contactInfo, url: e.target.value })}
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Remplissez le formulaire pour générer votre QR code
          </p>
        </div>
      )}

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 my-6">
        <div ref={qrContainerRef} className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border" />
        {qrData && (
          <div className="flex gap-2">
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              type="button"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              type="button"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copié !' : 'Copier les données'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              type="button"
            >
              Effacer tous les champs
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center mt-6">
        Générez des QR codes instantanément – Aucune donnée stockée – Gratuit d'utilisation
      </div>
    </div>
  );
};

export default QRCodeGenerator;
