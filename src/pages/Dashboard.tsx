import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { getUserPages } from '../lib/firestore';
import { motion } from 'motion/react';
import { Plus, ExternalLink, Eye, Clock, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard({ user }: { user: User }) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPages() {
      const data = await getUserPages(user.uid);
      if (data) {
        // Sort by createdAt desc
        data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setPages(data);
      }
      setLoading(false);
    }
    fetchPages();
  }, [user]);

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            Meu Painel
          </h1>
          <p className="text-gray-500">Gerencie suas páginas de serviço e acompanhe os resultados.</p>
        </div>
        <Link
          to="/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Página
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Você ainda não tem páginas</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Crie sua primeira página de serviço agora mesmo e comece a vender online de forma profissional.
          </p>
          <Link
            to="/create"
            className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block"
          >
            Criar Minha Primeira Página
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={page.serviceName}>
                  {page.serviceName}
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  Ativa
                </span>
              </div>
              
              <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">
                {page.generatedTitle}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{page.views || 0} acessos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {page.createdAt ? format(page.createdAt.toDate(), "dd 'de' MMM", { locale: ptBR }) : 'Agora'}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <Link
                  to={`/p/${page.id}`}
                  target="_blank"
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Página
                </Link>
                <button
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                          alert('Analisando concorrentes locais... Isso pode levar alguns segundos.');
                          const { findLocalCompetitors } = await import('../lib/gemini');
                          const result = await findLocalCompetitors(page.serviceName, position.coords.latitude, position.coords.longitude);
                          alert(result.text + (result.places.length > 0 ? '\n\nLinks:\n' + result.places.join('\n') : ''));
                        } catch (e) {
                          alert('Erro ao analisar concorrentes.');
                        }
                      }, () => {
                        alert('Permissão de localização necessária para esta função.');
                      });
                    }
                  }}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  title="Analisar Concorrentes Locais"
                >
                  Analisar
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/p/${page.id}`);
                    alert('Link copiado!');
                  }}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Copiar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
