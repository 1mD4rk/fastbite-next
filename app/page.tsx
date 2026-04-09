'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { nunito } from '@/components/jsx/font.jsx';
import Navbar from '@/components//jsx/navbar.jsx';
import Title from '@/components//jsx/title.jsx';
import Cardfood from '@/components//jsx/tarjeta.jsx';
import Aniadir from '@/components//jsx/aniadir.jsx';
import EditarProducto from '@/components//jsx/editar.jsx';
import ConfirmarAccion from '@/components/jsx/confirmar.jsx';

export default function HomePage() {
    // -- ESTADOS DE MODALES --
    const [isAniadirOpen, setIsAniadirOpen] = useState(false);
    const [isEditarOpen, setIsEditarOpen] = useState(false);
    const [isConfirmarOpen, setIsConfirmarOpen] = useState(false);

    // --- ESTADOS DE DATOS ---
    const [categorias, setCategorias] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [configConfirmacion, setConfigConfirmacion] = useState({
        titulo: '',
        mensaje: '',
        tipo: 'danger' as 'danger' | 'warning',
        accion: () => {}
    });

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = async () => {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error cargando productos:', error);
        } else {
            setProductos(data || []); 
        }
    };

    useEffect(() => {
        const fetchCategorias = async () => {
            const { data, error } = await supabase
                .from('categorias')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) {
                console.error('Error cargando categorías:', error);
            } else {
                setCategorias(data || []); 
            }
        };
        fetchCategorias();
        fetchData();
    }, [supabase]);

    // --- MANEJADORES DE EVENTOS ---

    const abrirEditar = (producto: any) => {
        setProductoSeleccionado(producto);
        setIsEditarOpen(true);
    };

    const abrirEliminar = (producto: any) => {
        setProductoSeleccionado(producto);
        setConfigConfirmacion({
            titulo: "Eliminar Producto",
            mensaje: `¿Estás seguro de que deseas eliminar permanentemente "${producto.nombre}"? Esta acción no se puede deshacer.`,
            tipo: 'danger',
            accion: async () => {
                try {
                    // Eliminar imagen del storage si existe
                    if (producto.imagen) {
                        const fileName = producto.imagen.split('/').pop();
                        if (fileName) {
                            const { error: storageError } = await supabase.storage
                                .from('productos')
                                .remove([fileName]);
                            if (storageError) console.error('Error al eliminar imagen:', storageError);
                        }
                    }
                    // Eliminar registro de la base de datos
                    const { error } = await supabase
                        .from('productos')
                        .delete()
                        .eq('id', producto.id);
                    if (error) throw error;

                    setIsConfirmarOpen(false);
                    fetchData(); // Recargar lista
                } catch (err) {
                    console.error('Error al eliminar producto:', err);
                    alert('No se pudo eliminar el producto');
                    setIsConfirmarOpen(false);
                }
            }
        });
        setIsConfirmarOpen(true);
    };

    const abrirCambiarEstado = (producto: any) => {
        setProductoSeleccionado(producto);
        const nuevoEstado = !producto.estado;
        setConfigConfirmacion({
            titulo: "Cambiar Visibilidad",
            mensaje: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} la visibilidad de "${producto.nombre}"?`,
            tipo: 'warning',
            accion: async () => {
                try {
                    const { error } = await supabase
                        .from('productos')
                        .update({ estado: nuevoEstado })
                        .eq('id', producto.id);
                    if (error) throw error;
                    setIsConfirmarOpen(false);
                    fetchData(); // Refrescar lista
                } catch (err) {
                    console.error('Error al cambiar estado:', err);
                    alert('No se pudo cambiar el estado del producto');
                    setIsConfirmarOpen(false);
                }
            }
        });
        setIsConfirmarOpen(true);
    };

    return (
        <div className={`bg-[#F8F9FA] min-h-screen ${nunito.className}`}>
            <header><Navbar /></header>
            
            <Title 
                title="Gestión de Productos" 
                onOpenModal={() => setIsAniadirOpen(true)} 
            />
            
            <div className='flex justify-center'>
                    {/* Contenedor de la tarjeta */}
                    <div className="rounded-lg border border-[#d1d1d1] shadow-lg p-1 w-326 h-12">
                        
                        {/* Contenido Flex (Fila) */}
                        <div className="flex items-center">
      
                            {/* Círculo Rojo (Icono/Número) */}
                            <div className=" bg-[#B8001F]/12 p-0 rounded-full mr-3 mt-1 ml-2 size-7.5 flex items-center justify-center">
                                <span className={`text-[#B8001F] font-bold text-sm ${nunito.className}`}>
                                    {productos.length}
                                </span>
                            </div>

                            {/* Texto */}
                            <div>
                                <p className={`font-bold text-[15px] text-[#000000ff] mt-1 ${nunito.className}`}>Total Productos</p>
                            </div>
                            
                        </div>
                    </div>
            </div>
            
            <div className="p-10 flex flex-wrap justify-center gap-6">
                {productos.length > 0 ? (
                    productos.map((producto) => {
                        const categoriaDelProducto = categorias.find(
                            (c) => c.id === producto.id_categoria
                        );
                        const nombreCategoria = categoriaDelProducto ? categoriaDelProducto.nombre : "Sin categoría";

                        return (
                            <Cardfood 
                                key={producto.id}
                                precio={producto.precio} 
                                categoria={nombreCategoria} 
                                tamaño={producto.tamano || "Estándar"} 
                                titulo={producto.nombre} 
                                descripcion={producto.descripcion || "Sin descripción"} 
                                estado={producto.estado} 
                                imagen={producto.imagen || "goku.png"}
                                onEdit={() => abrirEditar(producto)}
                                onDelete={() => abrirEliminar(producto)}
                                onToggleVisible={() => abrirCambiarEstado(producto)}
                            />
                        );
                    })
                ) : (
                    <p className="text-gray-500">Cargando productos o no hay productos disponibles...</p>
                )}
            </div>

            {/* --- COMPONENTES DE MODAL --- */}

            {/* Modal para Añadir Nuevo */}
            <Aniadir 
                isModalOpen={isAniadirOpen} 
                onClose={() => setIsAniadirOpen(false)} 
                categorias={categorias as any} 
                onProductAdded={fetchData}
            />

            {/* Modal para Editar Existente */}
            <EditarProducto 
                isOpen={isEditarOpen} 
                onClose={() => setIsEditarOpen(false)} 
                producto={productoSeleccionado} 
                categorias={categorias as any} 
                onProductUpdated={fetchData}
            />

            {/* Modal de Confirmación Genérico (Borrar/Desactivar) */}
            <ConfirmarAccion 
                isOpen={isConfirmarOpen} 
                onClose={() => setIsConfirmarOpen(false)} 
                onConfirm={configConfirmacion.accion}
                titulo={configConfirmacion.titulo}
                mensaje={configConfirmacion.mensaje}
                tipo={configConfirmacion.tipo}
            />
        </div>
    );
}

{/* <div className="box-border size-32 border-4 p-4">
                <Images archivoImagen={require('./images/goku.png')} nombre="Goku" className="mx-1 size-5 self-center rounded-full" />
                <Images archivoImagen={require('./images/vegeta.jpg')} nombre="Vegeta" className="mx-1 size-5 self-center rounded-full" />
            </div>

             <div className="p-4">
                <div className="flow-root">
                    <div className="my-4">Well, let me tell you something, ...</div>
                </div>
                <div className="flow-root">
                    <div className="my-4">Sure, go ahead, laugh if you want...</div>
                </div>
            </div>

            <span className="inline-flex items-baseline">
                <Images archivoImagen={require('./images/vegeta.jpg')} nombre="Vegeta" className="mx-1 size-5 self-center rounded-full" />
                <span>Kramer</span>
            </span> */}

            // <table className="table-auto">
            //     <thead>
            //         <tr>
            //         <th>Song</th>
            //         <th>Artist</th>
            //         <th>Year</th>
            //         </tr>
            //     </thead>
            //     <tbody>
            //         <tr>
            //         <td>The Sliding Mr. Bones (Next Stop, Pottersville)</td>
            //         <td>Malcolm Lockyer</td>
            //         <td>1961</td>
            //         </tr>
            //         <tr>
            //         <td>Witchy Woman</td>
            //         <td>The Eagles</td>
            //         <td>1972</td>
            //         </tr>
            //         <tr>
            //         <td>Shining Star</td>
            //         <td>Earth, Wind, and Fire</td>
            //         <td>1975</td>
            //         </tr>
            //     </tbody>
            // </table>