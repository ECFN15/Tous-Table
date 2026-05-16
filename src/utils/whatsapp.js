const DEFAULT_COUNTRY_CODE = '33';
export const DEFAULT_WHATSAPP_PHONE = '07 77 32 41 78';

const formatEuros = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return `${number.toLocaleString('fr-FR')} EUR`;
};

const getItemPrice = (item = {}) => {
  if (item.priceOnRequest) return 'Prix sur demande';
  return formatEuros(item.currentPrice ?? item.startingPrice ?? item.price);
};

const getItemDimensions = (item = {}) => {
  if (item.width && item.depth && item.height) {
    return `${item.width} x ${item.depth} x ${item.height} cm`;
  }
  return item.dimensions || '';
};

const getItemLabel = (item = {}) => item.name || item.title || '';

const compactParts = (parts) => parts.filter(Boolean).join(' - ');

const buildMessage = (lines) => (
  lines
    .filter((line) => line !== null && line !== undefined && line !== false)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\nMerci\.$/, '\nMerci.')
    .trim()
);

const buildProductLine = (item = {}) => {
  const label = getItemLabel(item);
  if (!label) return '';

  const details = compactParts([
    getItemPrice(item),
    getItemDimensions(item),
    item.material || item.wood || item.category,
  ]);

  return details ? `"${label}" (${details})` : `"${label}"`;
};

const buildItemMessageBlock = (item = {}, fallbackLabel = 'cette pièce') => {
  const label = getItemLabel(item) || fallbackLabel;
  const price = getItemPrice(item);
  const dimensions = getItemDimensions(item);
  const material = item.material || item.wood || item.category;

  return [
    `- Pièce : ${label}`,
    price && `- Prix : ${price}`,
    dimensions && `- Dimensions : ${dimensions}`,
    material && `- Matière : ${material}`,
  ].filter(Boolean);
};

const buildShopMessageBlock = (item = {}) => {
  const label = getItemLabel(item) || 'ce produit du Comptoir';
  const price = formatEuros(item.price);

  return [
    `- Produit : ${label}`,
    item.brand && `- Marque : ${item.brand}`,
    price && `- Prix : ${price}`,
  ].filter(Boolean);
};

const genericMessages = [
  {
    id: 'general-info',
    title: 'Informations atelier',
    description: 'Une question générale sur les pièces ou l’atelier.',
    message: buildMessage([
      'Bonjour,',
      '',
      'Je souhaiterais avoir des informations sur vos meubles et votre atelier.',
      '',
      'Merci.',
    ]),
  },
  {
    id: 'delivery',
    title: 'Livraison',
    description: 'Délais, transport, zones desservies.',
    message: buildMessage([
      'Bonjour,',
      '',
      'Je souhaiterais avoir des informations sur la livraison de vos meubles.',
      '',
      'Merci.',
    ]),
  },
  {
    id: 'advice',
    title: 'Conseil personnalisé',
    description: 'Trouver une pièce adaptée à un intérieur.',
    message: buildMessage([
      'Bonjour,',
      '',
      'Je cherche un meuble ancien et j’aimerais être conseillé selon mon besoin.',
      '',
      'Merci.',
    ]),
  },
];

const productMessages = (item = {}) => {
  const itemBlock = buildItemMessageBlock(item);
  const isUnavailable = item.sold || Number(item.stock ?? 1) <= 0;

  return [
    {
      id: 'availability',
      title: isUnavailable ? 'Pièce vendue' : 'Disponibilité',
      description: isUnavailable ? 'Demander une alternative proche.' : 'Vérifier si la pièce est encore disponible.',
      message: isUnavailable
        ? buildMessage([
          'Bonjour,',
          '',
          'Je vous contacte au sujet de cette pièce :',
          ...itemBlock,
          '',
          'Je vois qu’elle n’est peut-être plus disponible.',
          'Auriez-vous une pièce similaire à me proposer ?',
          '',
          'Merci.',
        ])
        : buildMessage([
          'Bonjour,',
          '',
          'Je suis intéressé par cette pièce :',
          ...itemBlock,
          '',
          'Est-elle toujours disponible ?',
          '',
          'Merci.',
        ]),
    },
    {
      id: 'delivery-product',
      title: 'Transport',
      description: 'Livraison, délai, organisation.',
      message: buildMessage([
        'Bonjour,',
        '',
        'Je suis intéressé par cette pièce :',
        ...itemBlock,
        '',
        'Pouvez-vous m’indiquer les possibilités de livraison et le délai ?',
        '',
        'Merci.',
      ]),
    },
    {
      id: 'details',
      title: 'Détails de la pièce',
      description: 'Dimensions, état, finition, entretien.',
      message: buildMessage([
        'Bonjour,',
        '',
        'Je regarde cette pièce :',
        ...itemBlock,
        '',
        'Pouvez-vous me donner plus de détails sur son état et sa finition ?',
        'Conseillez-vous un produit d’entretien adapté ?',
        '',
        'Merci.',
      ]),
    },
  ];
};

const shopProductMessages = (item = {}) => {
  const productBlock = buildShopMessageBlock(item);

  return [
    {
      id: 'shop-use',
      title: 'Usage produit',
      description: 'Confirmer si le produit convient.',
      message: buildMessage([
        'Bonjour,',
        '',
        'Je regarde ce produit dans le Comptoir :',
        ...productBlock,
        '',
        'Pouvez-vous me confirmer s’il est adapté à mon meuble ou ma planche ?',
        '',
        'Merci.',
      ]),
    },
    {
      id: 'shop-precautions',
      title: 'Précautions',
      description: 'Application, sécurité, compatibilité.',
      message: buildMessage([
        'Bonjour,',
        '',
        'Je souhaiterais connaître les précautions d’utilisation pour ce produit :',
        ...productBlock,
        '',
        'Merci.',
      ]),
    },
    {
      id: 'shop-alternative',
      title: 'Alternative',
      description: 'Trouver le bon produit avant achat.',
      message: buildMessage([
        'Bonjour,',
        '',
        'J’hésite autour de ce produit :',
        ...productBlock,
        '',
        'Pouvez-vous me conseiller le produit le plus adapté ?',
        '',
        'Merci.',
      ]),
    },
  ];
};

const checkoutMessages = (cartCount = 0, cartTotal = 0) => {
  const cartLine = cartCount > 0
    ? `Mon panier contient ${cartCount} article${cartCount > 1 ? 's' : ''}${formatEuros(cartTotal) ? ` pour ${formatEuros(cartTotal)}` : ''}.`
    : '';

  return [
    {
      id: 'checkout-delivery',
      title: 'Livraison avant commande',
      description: 'Valider le transport avant paiement.',
      message: buildMessage([
        'Bonjour,',
        '',
        'J’ai une question sur la livraison avant de finaliser ma commande.',
        cartLine,
        '',
        'Merci.',
      ]),
    },
    {
      id: 'checkout-payment',
      title: 'Paiement',
      description: 'Être rassuré avant validation.',
      message: buildMessage([
        'Bonjour,',
        '',
        'J’ai une question avant de finaliser le paiement sur Tous à Table.',
        cartLine,
        '',
        'Merci.',
      ]),
    },
    {
      id: 'checkout-help',
      title: 'Aide commande',
      description: 'Demander un accompagnement.',
      message: buildMessage([
        'Bonjour,',
        '',
        'Je suis en train de préparer une commande sur Tous à Table et j’aimerais être accompagné.',
        cartLine,
        '',
        'Merci.',
      ]),
    },
  ];
};

const orderMessages = [
  {
    id: 'order-followup',
    title: 'Suivi commande',
    description: 'Transport, statut, prochaine étape.',
    message: buildMessage([
      'Bonjour,',
      '',
      'J’ai une question concernant le suivi de ma commande Tous à Table.',
      '',
      'Merci.',
    ]),
  },
  {
    id: 'order-delivery',
    title: 'Livraison commande',
    description: 'Coordonner la réception.',
    message: buildMessage([
      'Bonjour,',
      '',
      'Je souhaiterais avoir des informations sur la livraison de ma commande Tous à Table.',
      '',
      'Merci.',
    ]),
  },
  {
    id: 'order-document',
    title: 'Document ou facture',
    description: 'Facture, règlement, confirmation.',
    message: buildMessage([
      'Bonjour,',
      '',
      'J’ai une question concernant les documents ou le règlement de ma commande Tous à Table.',
      '',
      'Merci.',
    ]),
  },
];

export const getWhatsAppContext = ({ view, item, cartCount = 0, cartTotal = 0 } = {}) => {
  if (view === 'detail') {
    return {
      eyebrow: 'Pièce sélectionnée',
      title: getItemLabel(item) || 'Question sur une pièce',
      intro: 'Choisissez le sujet, le message sera préparé dans WhatsApp.',
      productLine: buildProductLine(item),
      suggestions: productMessages(item),
    };
  }

  if (view === 'shop-detail') {
    return {
      eyebrow: 'Comptoir',
      title: getItemLabel(item) || 'Question produit',
      intro: 'Demandez un conseil avant achat ou utilisation.',
      productLine: buildProductLine(item),
      suggestions: shopProductMessages(item),
    };
  }

  if (view === 'checkout') {
    return {
      eyebrow: 'Commande',
      title: 'Besoin d’aide avant validation ?',
      intro: 'Évitez le doute avant paiement ou livraison.',
      suggestions: checkoutMessages(cartCount, cartTotal),
    };
  }

  if (view === 'my-orders') {
    return {
      eyebrow: 'Après commande',
      title: 'Suivi et livraison',
      intro: 'Contactez l’atelier avec un motif clair.',
      suggestions: orderMessages,
    };
  }

  if (view === 'shop') {
    return {
      eyebrow: 'Comptoir',
      title: 'Conseil entretien',
      intro: 'Demandez quel produit convient à votre bois.',
      suggestions: [
        {
          id: 'shop-general',
          title: 'Choisir un produit',
          description: 'Huile, cire, nettoyage, restauration.',
          message: buildMessage([
            'Bonjour,',
            '',
            'Je cherche un produit du Comptoir adapté à mon meuble ou ma planche.',
            'Pouvez-vous me conseiller ?',
            '',
            'Merci.',
          ]),
        },
        ...genericMessages.slice(1),
      ],
    };
  }

  return {
    eyebrow: 'Atelier',
    title: 'Contacter l’atelier',
    intro: 'Sélectionnez une demande, puis ouvrez WhatsApp.',
    suggestions: genericMessages,
  };
};

export const normalizeWhatsAppPhone = (phone, defaultCountryCode = DEFAULT_COUNTRY_CODE) => {
  const value = String(phone || '').trim();
  if (!value) return '';

  if (value.startsWith('+')) {
    return value.replace(/\D/g, '');
  }

  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith('0') && defaultCountryCode) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  return digits;
};

export const buildWhatsAppUrl = (phone, message = '') => {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return '';

  const text = String(message || '').trim();
  return text
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${normalizedPhone}`;
};

export const getWhatsAppPhoneFromContactInfo = (contactInfo = {}) => (
  contactInfo.whatsapp || contactInfo.phone || DEFAULT_WHATSAPP_PHONE
);
