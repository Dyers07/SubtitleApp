// src/components/v2/SubtitleDragOverlay.tsx - COMPLÈTEMENT REFAIT
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Move, Target } from 'lucide-react';

interface SubtitleDragOverlayProps {
  isVisible: boolean;
  subtitlePosition: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  currentSubtitle?: string;
  isPlaying: boolean;
  subtitleStyle?: any;
}

export function SubtitleDragOverlay({
  isVisible,
  subtitlePosition,
  onPositionChange,
  containerRef,
  currentSubtitle,
  isPlaying,
  subtitleStyle,
}: SubtitleDragOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGuides, setShowGuides] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 🎯 Cacher pendant la lecture pour éviter la distraction
  if (!isVisible || isPlaying) return null;

  // 🚀 DRAG SIMPLE ET INTUITIF - Comme CapCut
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // Position actuelle des sous-titres en pixels
    const currentXPx = (subtitlePosition.x / 100) * containerRect.width;
    const currentYPx = (subtitlePosition.y / 100) * containerRect.height;
    
    // Calculer l'offset entre le clic et le centre des sous-titres
    setDragOffset({
      x: clickX - currentXPx,
      y: clickY - currentYPx,
    });
    
    setIsDragging(true);
    setShowGuides(true);
    
    // Cursor global
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    console.log('🚀 Début du drag des sous-titres');
  }, [containerRef, subtitlePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Position de la souris dans le conteneur
    const mouseX = e.clientX - containerRect.left - dragOffset.x;
    const mouseY = e.clientY - containerRect.top - dragOffset.y;
    
    // Convertir en pourcentage
    let newX = (mouseX / containerRect.width) * 100;
    let newY = (mouseY / containerRect.height) * 100;
    
    // 🎯 Contraintes de limites (avec marges)
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(10, Math.min(90, newY));
    
    // 🚀 SNAP aux guides (centre et tiers)
    const snapThreshold = 3; // 3% de tolérance
    
    // Snap horizontal (centre et tiers)
    if (Math.abs(newX - 50) < snapThreshold) newX = 50; // Centre
    if (Math.abs(newX - 33.33) < snapThreshold) newX = 33.33; // Tiers gauche
    if (Math.abs(newX - 66.67) < snapThreshold) newX = 66.67; // Tiers droit
    
    // Snap vertical (centre et positions communes)
    if (Math.abs(newY - 50) < snapThreshold) newY = 50; // Centre
    if (Math.abs(newY - 25) < snapThreshold) newY = 25; // Haut
    if (Math.abs(newY - 75) < snapThreshold) newY = 75; // Bas
    if (Math.abs(newY - 85) < snapThreshold) newY = 85; // Position TikTok
    
    onPositionChange({ x: newX, y: newY });
  }, [isDragging, containerRef, dragOffset, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setShowGuides(false);
      
      // Restaurer le cursor
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      console.log(`✅ Sous-titres repositionnés: ${subtitlePosition.x.toFixed(1)}%, ${subtitlePosition.y.toFixed(1)}%`);
    }
  }, [isDragging, subtitlePosition]);

  // Event listeners globaux
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 🎯 Calculer la taille approximative des sous-titres
  const getSubtitleDimensions = () => {
    if (!currentSubtitle || !containerRef.current) {
      return { width: 40, height: 12 };
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const fontSize = subtitleStyle?.fontSize || 36;
    const textLength = currentSubtitle.length;
    
    // Estimation intelligente basée sur le texte
    const estimatedWidthPx = Math.min(
      containerRect.width * 0.9, 
      textLength * (fontSize * 0.6)
    );
    const estimatedHeightPx = fontSize * 1.8; // Avec padding
    
    return {
      width: (estimatedWidthPx / containerRect.width) * 100,
      height: (estimatedHeightPx / containerRect.height) * 100,
    };
  };

  const dimensions = getSubtitleDimensions();

  return (
    <>
      {/* 🎯 GUIDES DE SNAP (seulement pendant le drag) */}
      {showGuides && isDragging && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Lignes de guidage verticales */}
          <div className="absolute left-1/3 top-0 h-full w-px bg-blue-400/40"></div>
          <div className="absolute left-1/2 top-0 h-full w-px bg-blue-500/60"></div>
          <div className="absolute right-1/3 top-0 h-full w-px bg-blue-400/40"></div>
          
          {/* Lignes de guidage horizontales */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-blue-400/40"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/60"></div>
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-blue-400/40"></div>
          <div className="absolute bottom-[15%] left-0 w-full h-px bg-green-400/50"></div>
        </div>
      )}
      
      {/* 🚀 ZONE DE DRAG INVISIBLE (sur tout le lecteur) */}
      <div
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Indication visuelle subtile */}
        {!isDragging && (
          <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white/60 px-2 py-1 rounded text-xs pointer-events-none">
            <Move size={12} className="inline mr-1" />
            Cliquer pour déplacer
          </div>
        )}
      </div>

      {/* 🎯 PREVIEW DES SOUS-TITRES avec transparence */}
      {currentSubtitle && (
        <div
          ref={overlayRef}
          className={`absolute pointer-events-none z-30 transition-all duration-200 ${
            isDragging ? 'scale-105' : ''
          }`}
          style={{
            left: `${subtitlePosition.x}%`,
            top: `${subtitlePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            minWidth: `${Math.max(dimensions.width, 20)}%`,
            maxWidth: '90%',
          }}
        >
          {/* 🎨 SOUS-TITRE EN TRANSPARENCE - Style identique au vrai */}
          <div
            className="text-center px-4 py-2 rounded-lg"
            style={{
              fontSize: `${Math.min(subtitleStyle?.fontSize || 36, 24)}px`, // Taille réduite pour l'aperçu
              fontFamily: subtitleStyle?.fontFamily || 'Arial',
              fontWeight: subtitleStyle?.fontWeight || 'bold',
              color: subtitleStyle?.color || '#FFFFFF',
              backgroundColor: subtitleStyle?.backgroundColor && subtitleStyle?.backgroundColor !== 'transparent'
                ? `${subtitleStyle.backgroundColor}${Math.floor((subtitleStyle?.backgroundOpacity || 0) * 255).toString(16).padStart(2, '0')}`
                : 'rgba(0, 0, 0, 0.3)',
              textShadow: subtitleStyle?.shadow !== 'none' 
                ? '2px 2px 4px rgba(0, 0, 0, 0.7)' 
                : 'none',
              textTransform: subtitleStyle?.textTransform || 'none',
              // 🚀 Stroke si activé
              ...(subtitleStyle?.strokeWeight && subtitleStyle.strokeWeight !== 'none' && {
                WebkitTextStroke: `2px ${subtitleStyle.strokeColor || '#000000'}`,
                paintOrder: 'stroke fill',
              }),
              // Transparence pour montrer que c'est un aperçu
              opacity: isDragging ? 0.9 : 0.7,
            }}
          >
            {currentSubtitle}
          </div>
          
          {/* 🎯 INDICATEUR DE POSITION */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap shadow-lg">
            <Target size={10} className="inline mr-1" />
            {subtitlePosition.x.toFixed(0)}%, {subtitlePosition.y.toFixed(0)}%
          </div>
        </div>
      )}

      {/* 🚀 INDICATEUR DE ZONE ACTIVE pendant le drag */}
      {isDragging && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg z-40">
          <Move size={16} className="animate-pulse" />
          <div>
            <div>Position: {subtitlePosition.x.toFixed(0)}%, {subtitlePosition.y.toFixed(0)}%</div>
            <div className="text-xs opacity-80">Relâchez pour confirmer</div>
          </div>
        </div>
      )}
    </>
  );
}