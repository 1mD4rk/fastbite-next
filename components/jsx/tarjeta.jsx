'use client';

import { nunito } from './font.jsx';

export default function Tarjeta({precio, categoria, tamaño, titulo, descripcion, estado, imagen, onEdit, onDelete, onToggleVisible}) {
  // Determinar si la imagen es una URL remota (Supabase) o local
  const esUrlRemota = imagen && (imagen.startsWith('http://') || imagen.startsWith('https://'));
  
  // Para imágenes locales, asumimos que están en /images/ (carpeta pública)
  const rutaImagen = esUrlRemota 
    ? imagen 
    : imagen 
      ? `/images/${imagen}` 
      : '/images/placeholder.png';

  return (
    <div className="w-70 max-w-sm bg-white rounded-lg shadow-sm border-3 border-[#B8001F] overflow-hidden flex flex-col">
      
      <div className="relative h-52 bg-gray-50 border-b border-gray-200">
        <img 
          src={rutaImagen}
          alt={titulo}
          className="w-full h-full object-contain p-4"
          onError={(e) => { e.target.src = '/images/placeholder.png'; }}
        />
        
        <div className="absolute bottom-3 left-3">
          <span className={`bg-green-600/90 text-white text-sm font-bold px-3 py-1 rounded shadow-sm ${nunito.className}`}>
            ${precio}
          </span>
        </div>
      </div>

      {/* Resto del componente igual */}
      <div className="p-3 flex flex-col grow">
        <div className="flex flex-wrap gap-2 mb-5">
          <span className={`bg-red-600/10 text-[#B8001F] text-xs font-bold px-2 py-1 rounded border border-red-200 ${nunito.className}`}>
            {categoria}
          </span>
          <span className={`bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200 ${nunito.className}`}>
            {tamaño}
          </span>
        </div>

        <h3 className={`text-xl font-bold text-gray-900 mb-1 leading-tight ${nunito.className}`}>
          {titulo}
        </h3>

        <p className={`text-sm text-gray-500 mb-4 line-clamp-4 ${nunito.className}`}>
          {descripcion}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          {estado ? (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700 text-xs font-bold ${nunito.className}`}>
              ✅ Visible
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-gray-100 text-gray-500 text-xs font-bold ${nunito.className}`}>
              ❌ Oculto
            </span>
          )}

          <div className="flex gap-2">
            <button onClick={onEdit} className="cursor-pointer p-1.5 border border-gray-300 text-gray-500 rounded hover:bg-gray-200 hover:text-blue-600 transition" title="Editar">
              ✏️
            </button>
            <button onClick={onToggleVisible} className="cursor-pointer p-1.5 border border-yellow-400 text-yellow-600 rounded hover:bg-yellow-200 transition" title="Desactivar">
              👁️
            </button>
            <button onClick={onDelete} className="cursor-pointer p-1.5 border border-red-400 text-red-500 rounded hover:bg-red-200 transition" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}