'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useDailyMenu } from '@/hooks/use-daily-menu';
import { RESTAURANT_NAME, MENU_PRICE } from '@/lib/constants';
import { formatDateSpanish, formatCurrency } from '@/lib/utils';
import {
  Share2,
  Copy,
  Download,
  MessageCircle,
  Check,
  UtensilsCrossed,
  Sparkles,
  Phone,
  Clock,
  Heart,
} from 'lucide-react';

export default function AdminCompartirPage() {
  const { grouped, loading } = useDailyMenu();
  const menuCardRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const todayFormatted = formatDateSpanish(new Date());

  const handleCopyLink = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/menu` : 'https://menuliz.vercel.app/menu';
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!menuCardRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(menuCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = `MenuLiz-Menu-Del-Dia.png`;
      a.click();
    } catch (err) {
      console.error('Error generating image canvas with html2canvas:', err);
      alert('Hubo un problema al generar la imagen. Intenta nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/menu` : 'https://menuliz.vercel.app/menu';

    let text = `🍲 *¡MENÚ DEL DÍA EN ${RESTAURANT_NAME.toUpperCase()}!* ✨\n`;
    text += `📅 *${todayFormatted}*\n\n`;
    text += `🔥 *Combo Completo a solo S/ ${MENU_PRICE.toFixed(2)}*\n`;
    text += `(1 Entrada + 1 Segundo + 1 Refresco)\n\n`;

    text += `🥗 *ENTRADAS:*\n`;
    grouped.entradas.filter((e) => e.is_available).forEach((e) => {
      text += `• ${e.name}\n`;
    });

    text += `\n🍛 *SEGUNDOS:*\n`;
    grouped.segundos.filter((s) => s.is_available).forEach((s) => {
      text += `• ${s.name}\n`;
    });

    text += `\n🥤 *REFRESCOS:*\n`;
    grouped.refrescos.filter((r) => r.is_available).forEach((r) => {
      text += `• ${r.name}\n`;
    });

    text += `\n🛵 *Pide tu almuerzo online aquí:* 👇\n${link}\n\n`;
    text += `_¡Te esperamos con el mejor sabor casero!_ 😋`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Compartir Menú de Hoy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Genera la imagen del menú para estados de WhatsApp o comparte el enlace directo
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>{downloading ? 'Generando...' : 'Descargar Imagen'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Visual Menu Card (Target for html2canvas) */}
      <div className="flex justify-center p-2 sm:p-6 bg-stone-200/50 rounded-3xl border border-stone-300/60">
        
        <div
          ref={menuCardRef}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xl"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 p-6 text-white text-center space-y-2 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white">
              Menu<span className="text-amber-200">Liz</span>
            </h2>

            <p className="text-xs text-orange-100 font-semibold">
              Restaurante de Almuerzos & Comida Casera
            </p>

            <div className="pt-2">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white text-orange-600 text-xs font-black shadow-xs capitalize">
                {todayFormatted}
              </span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="bg-amber-100/80 px-4 py-2.5 text-center text-amber-950 font-bold text-xs border-y border-amber-200">
            ⭐ 1 Entrada + 1 Segundo + 1 Refresco = <strong className="text-sm font-black text-orange-600">S/ {MENU_PRICE.toFixed(2)}</strong>
          </div>

          {/* Menu Sections */}
          <div className="p-6 space-y-5 text-xs">
            
            {/* Entradas */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-1.5">
                <span>🥗 Entradas:</span>
              </h4>
              <ul className="space-y-1 text-stone-700">
                {grouped.entradas.filter((e) => e.is_available).map((e) => (
                  <li key={e.id} className="flex justify-between font-semibold">
                    <span>• {e.name}</span>
                    <span className="text-stone-400 font-normal">{formatCurrency(e.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Segundos */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-1.5">
                <span>🍛 Segundos del Día:</span>
              </h4>
              <ul className="space-y-1 text-stone-700">
                {grouped.segundos.filter((s) => s.is_available).map((s) => (
                  <li key={s.id} className="flex justify-between font-semibold">
                    <span>• {s.name}</span>
                    <span className="text-stone-400 font-normal">{formatCurrency(s.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Refrescos */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-1.5">
                <span>🥤 Refrescos:</span>
              </h4>
              <ul className="space-y-1 text-stone-700">
                {grouped.refrescos.filter((r) => r.is_available).map((r) => (
                  <li key={r.id} className="flex justify-between font-semibold">
                    <span>• {r.name}</span>
                    <span className="text-stone-400 font-normal">{formatCurrency(r.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card Footer */}
            <div className="pt-4 border-t border-stone-100 text-center space-y-1 text-[11px] text-stone-500">
              <p className="font-bold text-stone-800">
                🛵 Delivery y pedidos al WhatsApp: +51 999 999 999
              </p>
              <p>Pide en línea en: <strong className="text-orange-600">menuliz.vercel.app</strong></p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
