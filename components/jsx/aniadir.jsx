// aniadir.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { nunito } from './font.jsx';

export default function ListaProductos({ isModalOpen, onClose, categorias = [], onProductAdded }) {
  const [shouldRender, setShouldRender] = useState(isModalOpen);
  const [tipoProducto, setTipoProducto] = useState('con_tamano');
  const overlayRef = useRef(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tamano, setTamano] = useState('Pequeño');
  const [precio, setPrecio] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categoriasConTamano = ['Pizzas', 'Bebidas', 'Papas Fritas', 'Alitas de Pollo', 'Postres'];

  // Cliente de Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (isModalOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      // Resetear formulario al abrir
      setNombre('');
      setDescripcion('');
      setCategoriaId('');
      setTamano('Pequeño');
      setPrecio('');
      setImagenFile(null);
      setError('');
      setTipoProducto('con_tamano');
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  const handleAnimationEnd = () => {
    if (!isModalOpen) setShouldRender(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
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
    if (tipoProducto === 'con_tamano') {
      if (!precio || parseFloat(precio) <= 0) {
        setError('El precio es obligatorio y debe ser mayor a 0');
        return;
      }
    } else {
      if (!precio || parseFloat(precio) <= 0) {
        setError('El precio es obligatorio y debe ser mayor a 0');
        return;
      }
    }

    setIsLoading(true);

    try {
      let imagenUrl = null;

      // Subir imagen si se seleccionó una
      if (imagenFile) {
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('productos')
          .upload(fileName, imagenFile);

        if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);

        imagenUrl = publicUrlData.publicUrl;
      }

      // Insertar producto
      const nuevoProducto = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        id_categoria: parseInt(categoriaId),
        estado: true,
        imagen: imagenUrl,
      };

      if (tipoProducto === 'con_tamano') {
        nuevoProducto.tamano = tamano;
        nuevoProducto.precio = parseFloat(precio);
      } else {
        nuevoProducto.tamano = null;
        nuevoProducto.precio = parseFloat(precio);
      }

      const { error: insertError } = await supabase
        .from('productos')
        .insert([nuevoProducto]);

      if (insertError) throw new Error('Error al guardar el producto: ' + insertError.message);

      // Éxito
      if (onProductAdded) await onProductAdded(); // Refrescar lista
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300 ${
        isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-t-8 border-[#B8001F] ${nunito.className} transition-all duration-300 transform ${
          isModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Añadir Producto</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selector de Tipo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipoProducto('con_tamano')}
              className={`cursor-pointer flex-1 py-2 px-4 rounded-md font-semibold border transition-all duration-300 ${
                tipoProducto === 'con_tamano' ? 'bg-[#B8001F] text-white border-[#B8001F]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#B8001F]'
              }`}
            >Con Tamaño</button>
            <button
              type="button"
              onClick={() => setTipoProducto('sin_tamano')}
              className={`cursor-pointer flex-1 py-2 px-4 rounded-md font-semibold border transition-all duration-300 ${
                tipoProducto === 'sin_tamano' ? 'bg-[#B8001F] text-white border-[#B8001F]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#B8001F]'
              }`}
            >Sin Tamaño</button>
          </div>

          {/* Nombre y Descripción */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="Ej: Super Burger" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#B8001F]/20 focus:border-[#B8001F] text-gray-800 placeholder:text-gray-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <textarea 
                rows="2" 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#B8001F]/20 focus:border-[#B8001F] text-gray-800"
              />
            </div>
          </div>

          {/* Sección Dinámica */}
          <div className="space-y-4 transition-all duration-500 ease-in-out">
            <div className="grid grid-cols-2 gap-4 transition-all duration-500 ease-in-out">
              <div className="col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                <select 
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="cursor-pointer w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#B8001F] text-gray-800 bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {categorias
                    .filter(cat => tipoProducto === 'con_tamano' ? categoriasConTamano.includes(cat.nombre) : !categoriasConTamano.includes(cat.nombre))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))
                  }
                </select>
              </div>

              <div className="col-span-1 transition-all duration-500 ease-in-out">
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  tipoProducto === 'con_tamano' ? 'opacity-100 max-h-40 translate-y-0' : 'opacity-0 max-h-0 -translate-y-2'
                }`}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tamaño</label>
                  <select 
                    value={tamano}
                    onChange={(e) => setTamano(e.target.value)}
                    className="cursor-pointer w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#B8001F] text-gray-800 bg-white"
                  >
                    <option>Pequeño</option><option>Mediano</option><option>Grande</option>
                  </select>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  tipoProducto === 'sin_tamano' ? 'opacity-100 max-h-40 translate-y-0 mt-0' : 'opacity-0 max-h-0 -translate-y-2'
                }`}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-600 font-semibold">$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 pl-7 outline-none focus:border-[#B8001F] text-gray-800" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                tipoProducto === 'con_tamano' ? 'opacity-100 max-h-40 translate-y-0 animate-fadeInDown' : 'opacity-0 max-h-0 -translate-y-2'
            }`}>
                <label className="block text-sm font-bold text-gray-700 mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-600 font-semibold">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-7 outline-none focus:border-[#B8001F] text-gray-800" 
                  />
                </div>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del producto</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files[0])}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B8001F]/10 file:text-[#B8001F] hover:file:bg-[#B8001F]/20 cursor-pointer" 
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="cursor-pointer flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all duration-300">Cerrar</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="cursor-pointer flex-1 px-4 py-2.5 bg-[#B8001F] text-white rounded-lg font-bold hover:bg-[#9c0019ff] shadow-lg shadow-[#B8001F]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}