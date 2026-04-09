'use client';

import Image from 'next/image';

export default function Images({ archivoImagen, nombre, className = '' }) {
    return <Image src={archivoImagen} alt={nombre} className={className} />;
}