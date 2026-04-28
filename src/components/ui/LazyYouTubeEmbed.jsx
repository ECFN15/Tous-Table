import React, { useState } from 'react';

const LazyYouTubeEmbed = ({ videoId, title, className = '' }) => {
    const [shouldLoad, setShouldLoad] = useState(false);

    if (!videoId) {
        return <div className={`relative bg-black ${className}`} />;
    }

    return (
        <div className={`relative bg-black ${className}`}>
            {shouldLoad ? (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setShouldLoad(true)}
                    aria-label={`Lire la video ${title || ''}`}
                    className="absolute inset-0 h-full w-full overflow-hidden text-white"
                >
                    <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl">
                            <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-white" />
                        </span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default React.memo(LazyYouTubeEmbed);
