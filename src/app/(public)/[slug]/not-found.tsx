import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <div className="w-24 h-1 bg-gray-800 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Restaurante no encontrado
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Lo sentimos, no pudimos encontrar el menú que buscas.
            Verifica que la URL sea correcta o contacta al restaurante para obtener el enlace correcto.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            ¿Tienes un restaurante y quieres crear tu menú digital?
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
