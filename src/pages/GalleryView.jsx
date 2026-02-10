import React, { useState } from 'react';
import { useLiveTheme } from '../hooks/useLiveTheme';

// DESIGNS (Layouts)
import ArchitecturalLayout from '../designs/architectural/MarketplaceLayout';
import SEO from '../components/SEO';

// SEO component is imported at the top.

const GalleryView = ({ items, boardItems = [], isAdmin, isSecretGateOpen, user, onSelectItem, onShowLogin, onShowComments, darkMode = false, onOpenMenu, onOpenCart, toggleTheme }) => {
    const [filter, setFilter] = useState('fixed');
    const [activeCollection, setActiveCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'
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



    const handleCommentClick = (e, item) => {
        e.stopPropagation();
        onShowComments(item, activeCollection);
    };

    const handleSelectItem = (id) => {
        onSelectItem(id);
    };

    // Always use Architectural
    const LayoutComponent = ArchitecturalLayout;

    return (
        <div className="min-h-screen">
            <SEO
                title="La Galerie - Marketplace Ébénisterie d'Art"
                description="Découvrez nos pièces uniques de mobilier et d'objets d'art restaurés ou créés à la main. Enchères exclusives et vente directe."
                url="/?page=gallery"
            />

            <LayoutComponent
                items={filteredItems}
                palette={palette}
                viewMode={viewMode}
                onComment={handleCommentClick}
                onSelectItem={handleSelectItem}
                onShowLogin={onShowLogin}
                darkMode={darkMode}
                user={user}
                onOpenMenu={onOpenMenu}
                onOpenCart={onOpenCart}
                toggleTheme={toggleTheme}
                headerProps={{
                    activeCollection,
                    setActiveCollection,
                    filter,
                    setFilter,
                    setViewMode,
                    viewMode
                }}
            />
        </div>
    );
};

export default GalleryView;

