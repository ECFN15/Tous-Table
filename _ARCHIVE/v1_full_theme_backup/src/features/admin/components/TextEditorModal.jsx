import React, { useState, useEffect } from 'react';
import { X, Save, Type } from 'lucide-react';

const TextEditorModal = ({ isOpen, onClose, onSave, itemKey, initialData, fields, darkMode }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else {
            setFormData({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(itemKey, formData);
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all ${darkMode ? 'bg-stone-900 border border-stone-700' : 'bg-[#FAF9F6] border border-white'}`}>

                {/* Header */}
                <div className={`px-8 py-6 border-b flex justify-between items-center ${darkMode ? 'border-stone-800' : 'border-black/5 bg-white'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'}`}>
                            <Type size={18} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Éditer le texte</h3>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{itemKey}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-500'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className={`block text-xs font-black uppercase tracking-widest ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                {field.label}
                            </label>

                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.key}
                                    value={formData[field.key] || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder={field.placeholder}
                                    className={`w-full p-4 rounded-xl border-2 bg-transparent transition-all outline-none focus:ring-4 ${darkMode ? 'border-stone-700 focus:border-stone-500 focus:ring-stone-500/20 text-white placeholder-stone-700' : 'border-stone-200 focus:border-stone-900 focus:ring-stone-900/10 text-stone-900 placeholder-stone-300'}`}
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={field.key}
                                    value={formData[field.key] || ''}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className={`w-full p-4 rounded-xl border-2 bg-transparent transition-all outline-none focus:ring-4 ${darkMode ? 'border-stone-700 focus:border-stone-500 focus:ring-stone-500/20 text-white placeholder-stone-700' : 'border-stone-200 focus:border-stone-900 focus:ring-stone-900/10 text-stone-900 placeholder-stone-300'}`}
                                />
                            )}
                            <p className="text-[10px] text-stone-400 italic">{field.help}</p>
                        </div>
                    ))}
                </form>

                {/* Footer */}
                <div className={`px-8 py-6 border-t flex justify-end gap-4 ${darkMode ? 'border-stone-800 bg-stone-900' : 'border-black/5 bg-stone-50'}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                    >
                        <Save size={14} />
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TextEditorModal;
