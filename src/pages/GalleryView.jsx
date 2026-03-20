import React, { useState, useMemo } from 'react';
import { useLiveTheme } from '../hooks/useLiveTheme';

// DESIGNS (Layouts)
import ArchitecturalLayout from '../designs/architectural/MarketplaceLayout';
import SEO from '../components/shared/SEO';

// SEO component is imported at the top.

const GalleryView = ({ 
    items, boardItems = [], user, onSelectItem, onShowLogin, darkMode = false,
    onOpenMenu, onOpenCart, toggleTheme, setHeaderProps,
    persistentGalleryState, saveGalleryState 
}) => {
    const [filter, setFilter] = useState(persistentGalleryState?.filter || 'fixed');
    const [activeCollection, setActiveCollection] = useState(persistentGalleryState?.activeCollection || 'furniture'); // 'furniture' | 'cutting_boards'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // THEME & DESIGN HOOK
    const { palette } = useLiveTheme(darkMode);

    // --- LOGIC: FILTER & SORT ---
    // 1. Choose collection source
    const sourceItems = activeCollection === 'furniture' ? items : boardItems;

    // 2. Filter by Status (Public only) & Type (Auction/Fixed)
    const filteredItems = sourceItems.filter(item => {
        if (item.status !== 'published') return false;

        // Séparation stricte : Enchères vs Vente Directe
        if (filter === 'auction') {
            return item.auctionActive === true;
        } else {
            return !item.auctionActive;
        }
    });





    const handleSelectItem = (id) => {
        // [PERSISTENCE] Save current sub-view state before navigating away
        if (saveGalleryState) {
            saveGalleryState({ activeCollection, filter });
        }
        onSelectItem(id);
    };

    // Always use Architectural
    const LayoutComponent = ArchitecturalLayout;

    return (
        <div className="min-h-screen">
            <SEO
                title="La Galerie — Meubles Anciens & Tables de Ferme"
                description="Découvrez nos pièces uniques de mobilier restauré : tables de ferme en chêne, armoires parisiennes, buffets normands. Enchères et vente directe. Livraison France entière."
                url="/?page=gallery"
            />

            <LayoutComponent
                items={filteredItems}
                palette={palette}
                viewMode={viewMode}
                onSelectItem={handleSelectItem}
                onShowLogin={onShowLogin}
                darkMode={darkMode}
                user={user}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                toggleTheme={toggleTheme}
                setHeaderProps={setHeaderProps}
                headerProps={useMemo(() => ({
                    activeCollection,
                    setActiveCollection: (val) => {
                        setActiveCollection(val);
                        if (saveGalleryState) saveGalleryState({ activeCollection: val });
                    },
                    filter,
                    setFilter: (val) => {
                        setFilter(val);
                        if (saveGalleryState) saveGalleryState({ filter: val });
                    },
                    setViewMode,
                    viewMode
                }), [activeCollection, filter, viewMode, saveGalleryState])}
            />
        </div>
    );
};

export default GalleryView;
