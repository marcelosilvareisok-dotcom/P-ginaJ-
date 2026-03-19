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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-serif text-[#1c1c1a] mb-2">Painel</h1>
          <p className="text-[#1c1c1a]/60 font-light">Gerencie suas páginas de serviço e acompanhe os resultados.</p>
        </div>
        <Link
          to="/create"
          className="bg-[#1c1c1a] text-[#f5f5f0] px-6 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-transform hover:scale-105 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Página
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-editorial p-16 text-center">
          <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto mb-8">
            <Plus className="w-8 h-8 text-[#1c1c1a]" />
          </div>
          <h3 className="text-2xl font-serif text-[#1c1c1a] mb-4">Você ainda não tem páginas</h3>
          <p className="text-[#1c1c1a]/60 font-light mb-10 max-w-md mx-auto">
            Crie sua primeira página de serviço agora mesmo e comece a vender online de forma profissional.
          </p>
          <Link
            to="/create"
            className="border border-[#1c1c1a] text-[#1c1c1a] hover:bg-[#1c1c1a] hover:text-[#f5f5f0] px-8 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-all inline-block"
          >
            Criar Minha Primeira Página
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl border border-editorial p-8 hover:border-[#1c1c1a]/30 transition-colors group relative flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-serif text-xl text-[#1c1c1a] line-clamp-1" title={page.serviceName}>
                  {page.serviceName}
                </h3>
                <span className="bg-[#f5f5f0] text-[#1c1c1a] text-[10px] uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                  Ativa
                </span>
              </div>
              
              <p className="text-[#1c1c1a]/60 font-light text-sm line-clamp-2 mb-8 flex-grow">
                {page.generatedTitle}
              </p>

              <div className="flex items-center gap-6 text-xs font-sans uppercase tracking-widest text-[#1c1c1a]/40 mb-8">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{page.views || 0} acessos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {page.createdAt ? format(page.createdAt.toDate(), "dd MMM", { locale: ptBR }) : 'Agora'}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-editorial flex flex-wrap gap-2">
                <Link
                  to={`/p/${page.id}`}
                  target="_blank"
                  className="flex-1 bg-[#1c1c1a] hover:bg-[#1c1c1a]/90 text-[#f5f5f0] px-4 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
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
                  className="bg-[#f5f5f0] hover:bg-[#e8e8e3] text-[#1c1c1a] px-4 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-widest transition-colors"
                  title="Analisar Concorrentes Locais"
                >
                  Analisar
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/p/${page.id}`);
                    alert('Link copiado!');
                  }}
                  className="bg-[#f5f5f0] hover:bg-[#e8e8e3] text-[#1c1c1a] px-4 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-widest transition-colors"
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
