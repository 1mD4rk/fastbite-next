'use client';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { nunito } from './font.jsx';

export default function EditarProducto({ isOpen, onClose, producto, categorias = [], onProductUpdated }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const overlayRef = useRef(null);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tamano, setTamano] = useState(''); // solo si el producto tiene tamaño
  const [imagenFile, setImagenFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (isOpen && producto) {
      setNombre(producto.nombre || '');
      setDescripcion(producto.descripcion || '');
      setPrecio(producto.precio?.toString() || '');
      setCategoriaId(producto.id_categoria?.toString() || '');
      setTamano(producto.tamano || ''); // si es null, queda vacío
      setImagenFile(null);
      setError('');
    }
  }, [isOpen, producto]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const eliminarImagenAnterior = async (urlImagen) => {
    if (!urlImagen) return;
    const fileName = urlImagen.split('/').pop();
    if (fileName) {
      await supabase.storage.from('productos').remove([fileName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    if (!categoriaId) {
      setError('Selecciona una categoría');
      return;
    }
    if (!precio || parseFloat(precio) <= 0) {
      setError('El precio es obligatorio y debe ser mayor a 0');
      return;
    }

    setIsLoading(true);

    try {
      let imagenUrl = producto.imagen; // mantener la actual por defecto

      // Subir nueva imagen si se seleccionó
      if (imagenFile) {
        if (producto.imagen) {
          await eliminarImagenAnterior(producto.imagen);
        }

        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, imagenFile);

        if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);

        imagenUrl = publicUrlData.publicUrl;
      }

      // Construir objeto de actualización
      const updateData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
        id_categoria: parseInt(categoriaId),
        imagen: imagenUrl,
      };

      // Solo incluir tamaño si el producto originalmente tenía tamaño
      if (producto.tamano) {
        updateData.tamano = tamano;
      }

      const { error: updateError } = await supabase
        .from('productos')
        .update(updateData)
        .eq('id', producto.id);

      if (updateError) throw new Error('Error al actualizar el producto: ' + updateError.message);

      if (onProductUpdated) await onProductUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!shouldRender || !producto) return null;

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-t-8 border-gray-600 ${nunito.className} transition-all duration-300 ease-out transform ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Editar Producto: {producto.nombre}</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-600/20 focus:border-gray-600 text-gray-800 bg-gray-50/50" 
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea 
              rows="4" 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-600/20 focus:border-gray-600 text-gray-800 bg-gray-50/50 resize-none"
            />
          </div>

          {/* Grid: Precio y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-gray-600/20 focus:border-gray-600 text-gray-800 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
              <div className="relative">
                <select 
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="cursor-pointer w-full border border-gray-300 rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-gray-600/20 focus:border-gray-600 text-gray-800 bg-gray-50/50 appearance-none"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</span>
              </div>
            </div>
          </div>

          {/* Tamaño - solo si el producto ya tiene tamaño */}
          {producto.tamano && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tamaño</label>
              <select
                value={tamano}
                onChange={(e) => setTamano(e.target.value)}
                className="cursor-pointer w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-600/20 focus:border-gray-600 text-gray-800 bg-gray-50/50"
              >
                <option value="Pequeño">Pequeño</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </div>
          )}

          {/* Imagen */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Imagen del producto</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files[0])}
              className="w-full text-sm text-gray-700 
                         file:mr-4 file:py-2.5 file:px-5 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-gray-600/10 file:text-gray-700 
                         hover:file:bg-gray-600/20 cursor-pointer
                         border border-gray-300 rounded-lg bg-gray-50/50" 
            />
            <p className="text-xs text-gray-500">Formatos aceptados: PNG, JPG, JPEG, WEBP. Tamaño máximo: 5MB</p>
            <p className="text-xs text-gray-600 truncate">
              Imagen actual: <span className="text-gray-600 font-medium">{producto.imagen || 'Sin imagen'}</span>
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="cursor-pointer px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition duration-150"
            >
              Cerrar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="cursor-pointer px-6 py-2.5 bg-[#6c757d] text-white rounded-lg font-semibold hover:bg-[#5a6268] shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}