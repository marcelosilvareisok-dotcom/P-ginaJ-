import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPage, incrementPageViews } from '../lib/firestore';
import { generateSpeech } from '../lib/gemini';
import { motion } from 'motion/react';
import { MessageCircle, Volume2, Loader2, Share2, ShieldCheck, Star } from 'lucide-react';

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      if (!id) return;
      const data = await getPage(id);
      if (data) {
        setPage(data);
        incrementPageViews(id);
      }
      setLoading(false);
    }
    fetchPage();
  }, [id]);

  const handlePlayAudio = async () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setPlaying(true);
      audio.play();
      audio.onended = () => setPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const url = await generateSpeech(page.generatedDescription);
      setAudioUrl(url);
      const audio = new Audio(url);
      setPlaying(true);
      audio.play();
      audio.onended = () => setPlaying(false);
    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Não foi possível gerar o áudio no momento.');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `Olá! Vi sua página de ${page.serviceName} e gostaria de mais informações.`;
    const url = `https://wa.me/${page.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!page) {
    return <div className="min-h-screen flex items-center justify-center">Página não encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl w-full overflow-hidden"
        >
          {/* Header Image Placeholder */}
          <div className="h-48 sm:h-64 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase shadow-sm">
                {page.serviceName}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              {page.generatedTitle}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="text-gray-500 font-medium">Serviço Recomendado</span>
            </div>

            <div className="prose prose-lg text-gray-600 mb-10">
              <p className="leading-relaxed whitespace-pre-wrap">{page.generatedDescription}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <button
                onClick={handlePlayAudio}
                disabled={audioLoading || playing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {audioLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : playing ? (
                  <Volume2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                {playing ? 'Ouvindo...' : 'Ouvir Descrição'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Investimento</p>
                  <p className="text-3xl font-extrabold text-gray-900">{page.price}</p>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span>Página verificada e segura</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado!');
              }}
              className="flex items-center gap-2 hover:text-gray-900 transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar Página
            </button>
          </div>
        </motion.div>
      </main>
      
      <footer className="py-6 text-center text-gray-400 text-sm">
        Criado com <a href="/" className="font-bold text-gray-500 hover:text-indigo-600 transition-colors">PáginaJá</a>
      </footer>
    </div>
  );
}
