import React, { useState, useEffect, useRef } from 'react';
import { Link, MessageSquare, User, LucideIcon } from 'lucide-react';

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

  // Couleurs de personnalisation
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

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

  // Correction : suppression de la variable inutilisée 'qr'
  const createQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    try {
      // Effacer le QR code précédent
      qrContainerRef.current.innerHTML = '';
      // Créer l'élément canvas
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);
      // Générer le QR code (pas de variable inutilisée)
      new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: bgColor,
        foreground: fgColor,
        level: 'M'
      });
      // Styliser le canvas
      canvas.style.maxWidth = '200px';
      canvas.style.height = '200px';
      canvas.style.border = '1px solid #ccc';
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
    img.style.maxWidth = '200px';
    img.style.height = '200px';
    img.style.border = '1px solid #ccc';
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
  }, [activeTab, urlInput, textInput, contactInfo, fgColor, bgColor]);

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

  const tabs: Tab[] = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Texte', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  return (
    <>
      <section id="generator-panel">
        <div className="form-section">
          <div id="tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <IconComponent className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'url' && (
            <input
              type="text"
              placeholder="Enter URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          )}

          {activeTab === 'text' && (
            <textarea
              rows={3}
              placeholder="Enter text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          )}

          {activeTab === 'contact' && (
            <div>
              <input
                type="text"
                placeholder="Name"
                value={contactInfo.firstName}
                onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              />
            </div>
          )}

          <button onClick={() => generateQRCode(qrData)}>Generate</button>
        </div>
        <div id="preview">
          <div ref={qrContainerRef} id="qr-preview" />
        </div>
      </section>

      {qrData && (
        <section id="customization">
          <h2>Customize</h2>
          <div className="color-picker">
            <label htmlFor="fgColor">Code Color</label>
            <input
              type="color"
              id="fgColor"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
            />
          </div>
          <div className="color-picker">
            <label htmlFor="bgColor">Background Color</label>
            <input
              type="color"
              id="bgColor"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
          <div id="download-options">
            <button onClick={downloadQRCode}>Download PNG</button>
          </div>
        </section>
      )}
    </>
  );
};

export default QRCodeGenerator;
