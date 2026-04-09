'use client';

import 'tailwindcss';
import Images from './images.jsx';
import { nunito } from './font.jsx';

export default function Navbar() {
  return (
<nav className="relative shadow-lg bg-[#B8001F] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
  <div className="mx-auto px-1 sm:px-5 lg:px-5">
    <div className="relative flex h-14 items-center justify-between ">

        {/* --- IZQUIERDA: Logo y Textos --- */}
        <div className="flex items-center shrink-0">
          <Images archivoImagen={require('../images/hamburguer.png')} nombre="hamburguer" className="h-10.5 w-auto" />
            <div className="grid justify-items-start">
                <Images archivoImagen={require('../images/fastbite.png')} nombre="fastbite" className="h-6.5 w-auto ml-2" />
                <Images archivoImagen={require('../images/subtitle.png')} nombre="subtitle" className="h-3.5 w-auto ml-2" />
            </div>
        </div>

        {/* --- CENTRO: Barra de Búsqueda --- */}
        <div className="flex flex-1 justify-center mr-15">
            <div className="w-full max-w-lg">
                <label htmlFor="search" className="JosefinSans_Medium sr-only">Buscar</label>
                <div className="relative text-gray-100 focus-within:text-gray-200">        
                  {/* El Input */}
                  <input
                    name="search"
                    id="search"
                    className="block w-full rounded-full border-0 bg-white py-1.5 pl-10 pr-3 text-black placeholder:text-black/55 focus:bg-gray-100 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6.5 transition-colors"
                    placeholder="Buscar productos..."
                    type="search"
                  />
                  {/* Ícono de Lupa (Position Absolute) */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Images archivoImagen={require('../images/search.png')} nombre="lupa" className="h-5 w-5" />
                  </div>
                </div>
            </div>
        </div>

        {/* --- DERECHA: Perfil --- */}
        <div className="flex bg-black/25 rounded-full p-1.5 items-center gap-3">
            <Images 
                archivoImagen={require('../images/user.png')} 
                nombre="user" 
                className="size-8 rounded-full outline -outline-offset-1 outline-white/25" 
            />
            <p className={`text-white mr-3 font-medium ${nunito.className}`}>admin</p>
        </div>
    </div>
  </div>

    {/* IMAGENES LOGO */}
  <el-disclosure id="mobile-menu" hidden className="block sm:hidden">
    <div className="space-y-1 px-2 pt-2 pb-3">
      <a href="#" aria-current="page" className="block rounded-md bg-gray-950/50 px-3 py-2 text-base font-medium text-white">Dashboard</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Team</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Projects</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Calendar</a>
    </div>
  </el-disclosure>
</nav>
    );
}


{/* <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg> */}