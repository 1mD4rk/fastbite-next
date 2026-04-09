'use client';
import { nunito } from './font.jsx';

export default function Header({ title, onOpenModal }) { 
  return (
    <div className="py-8 px-8 lg:px-27"> 
        <div className="flex justify-between items-center">              
            <div>
                <h1 className={`text-4xl font-bold mb-1 text-[#000000ff] ${nunito.className}`}>
                    {title ? title : "No hay titulo"}
                </h1>
                <p className={`text-[#5a5f63] text-sm ${nunito.className}`}>
                    Administra el menú de FastBite 🍔 
                </p>
            </div>   
            <button 
                onClick={onOpenModal}
                className="cursor-pointer bg-[#B8001F] hover:bg-[#9c0019ff] text-white font-bold py-2 px-4 rounded transition-colors"
            >
                + Añadir Producto
            </button>
        </div>
    </div>
  );
}