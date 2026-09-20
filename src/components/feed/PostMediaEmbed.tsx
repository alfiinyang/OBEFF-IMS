'use client';

import React, { useState } from 'react';
import { Maximize2, ExternalLink, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface PostMediaEmbedProps {
  url?: string;
  alt?: string;
  className?: string;
  allowLightbox?: boolean;
}

/**
 * Extracts YouTube embed URL from various YouTube link formats
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

/**
 * Detects whether a URL is likely an image link or external media
 */
export function isLikelyImageUrl(url: string): boolean {
  if (!url) return false;
  if (getYouTubeEmbedUrl(url)) return false;

  // Direct image extensions
  if (/\.(jpeg|jpg|gif|png|webp|svg|avif|bmp|ico)(\?.*)?$/i.test(url)) return true;

  // Known image hosting domains & CDNs
  const imageDomains = [
    'unsplash.com',
    'images.unsplash.com',
    'imgur.com',
    'i.imgur.com',
    'postimg.cc',
    'i.postimg.cc',
    'cloudinary.com',
    'res.cloudinary.com',
    'giphy.com',
    'media.giphy.com',
    'tenor.com',
    'c.tenor.com',
    'pixabay.com',
    'cdn.pixabay.com',
    'pexels.com',
    'images.pexels.com',
    'wikimedia.org',
    'upload.wikimedia.org',
    'ibb.co',
    'i.ibb.co',
  ];

  try {
    const parsed = new URL(url);
    if (imageDomains.some((d) => parsed.hostname.includes(d))) return true;
  } catch (e) {
    // If not a full URL or data URI
    if (url.startsWith('data:image/')) return true;
  }

  // If it's a valid web URL and not YouTube, treat as embeddable media by default
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/');
}

export default function PostMediaEmbed({
  url,
  alt = 'Post visual media',
  className = '',
  allowLightbox = true,
}: PostMediaEmbedProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  if (!url) return null;

  const youtubeEmbed = getYouTubeEmbedUrl(url);

  // 1. YouTube Video Embed (Client-side stream, no platform server storage)
  if (youtubeEmbed) {
    return (
      <div className={`rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-black shadow-xs ${className}`}>
        <iframe
          src={youtubeEmbed}
          title="Embedded YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 2. Direct External Image Embed (Direct client-side hotlink with no-referrer, zero server download)
  if (loadFailed) {
    return (
      <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600 gap-3 ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-slate-200 text-slate-500 rounded-xl flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800">External Media Link</p>
            <p className="text-[11px] text-slate-500 truncate">{url}</p>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <span>Open External</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 ${className}`}>
        {/* Rendered directly via standard browser img, stripping Referer to allow cross-origin CDNs without 403 blocks */}
        <img
          src={url}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setLoadFailed(true)}
          onClick={() => allowLightbox && setLightboxOpen(true)}
          className={`w-full max-h-[520px] object-contain mx-auto transition duration-200 ${
            allowLightbox ? 'cursor-pointer hover:opacity-95' : ''
          }`}
        />

        {/* Zoom Overlay Indicator */}
        {allowLightbox && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Expand image"
            className="absolute bottom-3 right-3 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-xl backdrop-blur-xs opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer flex items-center gap-1 text-[11px] font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Full</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal for Full View */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>External Image Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl max-h-[80vh] flex items-center justify-center">
              <img
                src={url}
                alt={alt}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
