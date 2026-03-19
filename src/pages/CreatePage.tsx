import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { generatePageContent } from '../lib/gemini';
import { createPage } from '../lib/firestore';

export default function CreatePage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    price: '',
    whatsapp: '',
    theme: 'modern',
  });

  const handleNext = () => {
    if (step === 1 && !formData.serviceName) return;
    if (step === 2 && !formData.description) return;
    if (step === 3 && (!formData.price || !formData.whatsapp)) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Você precisa estar logado para criar uma página.');
      return;
    }

    setLoading(true);
    try {
      // 1. Generate AI content
      const aiContent = await generatePageContent(
        formData.serviceName,
        formData.description,
        formData.price
      );

      // 2. Save to Firestore
      const pageId = await createPage({
        userId: user.uid,
        serviceName: formData.serviceName,
        description: formData.description,
        price: formData.price,
        whatsapp: formData.whatsapp,
        theme: formData.theme,
        generatedTitle: aiContent.title,
        generatedDescription: aiContent.description,
      });

      if (pageId) {
        navigate(`/p/${pageId}`);
      }
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Ocorreu um erro ao gerar sua página. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-[#1c1c1a]" />
        </motion.div>
        <h2 className="text-2xl font-serif text-[#1c1c1a] mt-8 mb-2">Escrevendo sua página...</h2>
        <p className="text-[#1c1c1a]/60 font-light">Isso leva apenas alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="bg-white rounded-[2rem] border border-editorial p-10 md:p-16">
        
        {/* Progress */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-serif text-sm italic text-[#1c1c1a]/40">Passo {step} de 4</span>
          <div className="h-[1px] flex-1 bg-editorial">
            <div 
              className="h-full bg-[#1c1c1a] transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {step === 1 && (
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1c1c1a] mb-4 leading-tight">Qual serviço você oferece?</h2>
              <p className="text-[#1c1c1a]/60 font-light mb-12">Ex: Manicure, Consultoria Financeira, Design de Logos...</p>
              <input
                type="text"
                autoFocus
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="Nome do serviço"
                className="w-full text-3xl font-serif italic border-b border-editorial focus:border-[#1c1c1a] outline-none py-4 bg-transparent placeholder-[#1c1c1a]/20 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1c1c1a] mb-4 leading-tight">Como funciona?</h2>
              <p className="text-[#1c1c1a]/60 font-light mb-12">Explique brevemente o que está incluso no seu serviço.</p>
              <textarea
                autoFocus
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Faço unhas em gel com duração de 30 dias. Inclui cutilagem e esmaltação..."
                className="w-full text-2xl font-serif italic border-b border-editorial focus:border-[#1c1c1a] outline-none py-4 bg-transparent placeholder-[#1c1c1a]/20 transition-colors min-h-[150px] resize-none"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1c1c1a] mb-4 leading-tight">Preço e Contato</h2>
              <p className="text-[#1c1c1a]/60 font-light mb-12">Defina o valor e onde os clientes vão te chamar.</p>
              
              <div className="space-y-10">
                <div>
                  <label className="block text-xs font-sans text-[#1c1c1a]/60 mb-2 uppercase tracking-widest">Preço</label>
                  <input
                    type="text"
                    autoFocus
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: R$ 150,00 ou A partir de R$ 50"
                    className="w-full text-3xl font-serif italic border-b border-editorial focus:border-[#1c1c1a] outline-none py-3 bg-transparent placeholder-[#1c1c1a]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans text-[#1c1c1a]/60 mb-2 uppercase tracking-widest">Seu WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ex: 11999999999"
                    className="w-full text-3xl font-serif italic border-b border-editorial focus:border-[#1c1c1a] outline-none py-3 bg-transparent placeholder-[#1c1c1a]/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <h2 className="text-5xl font-serif text-[#1c1c1a] mb-6">Tudo pronto.</h2>
              <p className="text-[#1c1c1a]/60 font-light mb-12 max-w-md mx-auto">Vamos usar nossa tecnologia para criar uma página elegante e persuasiva para você.</p>
              
              <div className="inline-block text-left border border-editorial p-8 rounded-2xl">
                <ul className="space-y-4 text-[#1c1c1a]/80 font-light">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1a]"></span>
                    Título profissional
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1a]"></span>
                    Descrição persuasiva
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1a]"></span>
                    Layout elegante
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1a]"></span>
                    Integração WhatsApp
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-16 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-[#1c1c1a]/60 hover:text-[#1c1c1a] font-sans text-xs uppercase tracking-widest transition-colors"
              >
                Voltar
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="bg-[#1c1c1a] text-[#f5f5f0] px-8 py-3 rounded-full font-sans text-xs uppercase tracking-widest transition-transform hover:scale-105"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-[#1c1c1a] text-[#f5f5f0] px-10 py-4 rounded-full font-sans text-xs uppercase tracking-widest transition-transform hover:scale-105 flex items-center gap-3 w-full justify-center"
              >
                <Sparkles className="w-4 h-4" />
                Gerar Minha Página
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
