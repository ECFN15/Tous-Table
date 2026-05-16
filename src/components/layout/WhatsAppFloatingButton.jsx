import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Phone, Send, X } from 'lucide-react';
import whatsappLogo from '../../assets/whatsapp-logo.svg';
import { buildWhatsAppUrl, getWhatsAppContext, getWhatsAppPhoneFromContactInfo, normalizeWhatsAppPhone } from '../../utils/whatsapp';
import './WhatsAppFloatingButton.css';

const WhatsAppMark = ({ className = 'wa-mark' }) => (
  <img className={className} src={whatsappLogo} alt="" aria-hidden="true" draggable="false" />
);

const WhatsAppFloatingButton = ({
  contactInfo,
  view,
  item,
  cartCount = 0,
  cartTotal = 0,
  hidden = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);
  const phone = getWhatsAppPhoneFromContactInfo(contactInfo);
  const context = getWhatsAppContext({ view, item, cartCount, cartTotal });
  const [selectedId, setSelectedId] = useState(context.suggestions[0]?.id);
  const selectedSuggestion = context.suggestions.find((suggestion) => suggestion.id === selectedId) || context.suggestions[0];
  const [message, setMessage] = useState(selectedSuggestion?.message || '');
  const whatsappUrl = buildWhatsAppUrl(phone, message);
  const phoneHref = `tel:+${normalizeWhatsAppPhone(phone)}`;

  useEffect(() => {
    const firstSuggestion = context.suggestions[0];
    setSelectedId(firstSuggestion?.id);
    setMessage(firstSuggestion?.message || '');
  }, [context.title, context.eyebrow, view]);

  useEffect(() => {
    if (!hidden) return;
    setIsOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (!isOpen) return undefined;

    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (hidden || !whatsappUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Contacter l'atelier sur WhatsApp"
        aria-expanded={isOpen}
        className="wa-float"
      >
        <span className="wa-float__icon">
          <WhatsAppMark />
        </span>
        <span className="wa-float__label">Contacter l'atelier</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fermer WhatsApp"
              className="wa-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="whatsapp-panel-title"
              className="wa-panel"
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 31 }}
            >
              <div className="wa-panel__header">
                <div>
                  <div className="wa-panel__meta">
                    <span className="wa-panel__mark">
                      <WhatsAppMark />
                    </span>
                    <p className="wa-panel__eyebrow">{context.eyebrow}</p>
                  </div>
                  <h2 id="whatsapp-panel-title" className="wa-panel__title">
                    {context.title}
                  </h2>
                  <p className="wa-panel__intro">{context.intro}</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="wa-close"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="wa-panel__body" data-scroll-region>
                <div className="wa-choice-list">
                  {context.suggestions.map((suggestion) => {
                    const isSelected = suggestion.id === selectedSuggestion?.id;
                    return (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(suggestion.id);
                          setMessage(suggestion.message);
                        }}
                        className="wa-choice"
                        data-selected={isSelected}
                      >
                        <span className="wa-choice__title">{suggestion.title}</span>
                        <span className="wa-choice__desc">{suggestion.description}</span>
                        <span className="wa-choice__state" aria-hidden="true">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="wa-field">
                  <label htmlFor="whatsapp-message" className="wa-field__label">
                    <span>Message préparé</span>
                    <span className="wa-field__hint">modifiable</span>
                  </label>
                  <textarea
                    id="whatsapp-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    className="wa-textarea"
                  />
                </div>
              </div>

              <div className="wa-panel__actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="wa-action wa-action--primary"
                >
                  <Send size={16} />
                  Ouvrir WhatsApp
                  <ArrowUpRight size={14} />
                </a>
                <a href={phoneHref} className="wa-action wa-action--secondary">
                  <Phone size={15} />
                  Appeler
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppFloatingButton;
