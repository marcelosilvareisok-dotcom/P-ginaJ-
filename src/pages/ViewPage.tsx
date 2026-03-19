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
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-editorial max-w-3xl w-full overflow-hidden"
        >
          {/* Header Image Placeholder */}
          <div className="h-48 sm:h-64 bg-[#e8e8e3] relative flex items-center justify-center overflow-hidden">
            <div className="absolute w-[150%] h-[150%] bg-gradient-to-tr from-[#f5f5f0] to-transparent rounded-full opacity-50 blur-3xl mix-blend-multiply"></div>
            <div className="absolute bottom-8 left-8 sm:left-12">
              <span className="bg-white/80 backdrop-blur-md text-[#1c1c1a] px-4 py-1.5 rounded-full text-[10px] font-sans tracking-widest uppercase border border-editorial">
                {page.serviceName}
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#1c1c1a] leading-[1.1] mb-8">
              {page.generatedTitle}
            </h1>
            
            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center gap-1 text-[#1c1c1a]">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[#1c1c1a]/60 font-light text-sm uppercase tracking-widest">Serviço Recomendado</span>
            </div>

            <div className="prose prose-lg text-[#1c1c1a]/80 font-light mb-12">
              <p className="leading-relaxed whitespace-pre-wrap text-lg">{page.generatedDescription}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <button
                onClick={handlePlayAudio}
                disabled={audioLoading || playing}
                className="w-full sm:w-auto flex items-center justify-center gap-3 border border-[#1c1c1a] hover:bg-[#1c1c1a] hover:text-[#f5f5f0] text-[#1c1c1a] px-8 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {audioLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : playing ? (
                  <Volume2 className="w-4 h-4 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {playing ? 'Ouvindo...' : 'Ouvir Descrição'}
              </button>
            </div>

            <div className="bg-[#f5f5f0] rounded-3xl p-8 sm:p-10 border border-editorial">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                <div>
                  <p className="text-[10px] font-sans text-[#1c1c1a]/60 uppercase tracking-widest mb-2">Investimento</p>
                  <p className="text-4xl font-serif text-[#1c1c1a]">{page.price}</p>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-sans text-sm uppercase tracking-widest transition-transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 border-t border-editorial flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-[#1c1c1a]/60 font-sans uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#1c1c1a]" />
              <span>Página verificada</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado!');
              }}
              className="flex items-center gap-2 hover:text-[#1c1c1a] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </motion.div>
      </main>
      
      <footer className="py-8 text-center text-[#1c1c1a]/40 text-xs font-sans uppercase tracking-widest">
        Criado com <a href="/" className="text-[#1c1c1a] hover:underline transition-all">PáginaJá.</a>
      </footer>
    </div>
  );
}
