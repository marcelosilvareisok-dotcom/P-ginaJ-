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
          <Loader2 className="w-12 h-12 text-indigo-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">A IA está criando sua página...</h2>
        <p className="text-gray-500">Isso leva apenas alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-indigo-600' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Qual serviço você oferece?</h2>
              <p className="text-gray-500 mb-8">Ex: Manicure, Consultoria Financeira, Design de Logos...</p>
              <input
                type="text"
                autoFocus
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="Nome do serviço"
                className="w-full text-2xl font-medium border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-4 bg-transparent placeholder-gray-300 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Como funciona?</h2>
              <p className="text-gray-500 mb-8">Explique brevemente o que está incluso no seu serviço.</p>
              <textarea
                autoFocus
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Faço unhas em gel com duração de 30 dias. Inclui cutilagem e esmaltação..."
                className="w-full text-xl font-medium border-2 border-gray-200 rounded-xl focus:border-indigo-600 outline-none p-4 bg-transparent placeholder-gray-300 transition-colors min-h-[150px] resize-none"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Preço e Contato</h2>
              <p className="text-gray-500 mb-8">Defina o valor e onde os clientes vão te chamar.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Preço</label>
                  <input
                    type="text"
                    autoFocus
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: R$ 150,00 ou A partir de R$ 50"
                    className="w-full text-xl font-medium border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-3 bg-transparent placeholder-gray-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Seu WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ex: 11999999999"
                    className="w-full text-xl font-medium border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-3 bg-transparent placeholder-gray-300 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tudo pronto!</h2>
              <p className="text-gray-500 mb-8">Vamos usar Inteligência Artificial para criar uma página incrível para você.</p>
              
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 text-left">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  O que a IA vai fazer:
                </h4>
                <ul className="space-y-3 text-indigo-800 text-sm">
                  <li>✨ Criar um título profissional e chamativo</li>
                  <li>✍️ Escrever uma descrição persuasiva para vender mais</li>
                  <li>🎨 Montar um layout bonito e responsivo</li>
                  <li>📱 Configurar seu botão de WhatsApp</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2"
              >
                Voltar
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 flex items-center gap-2 w-full justify-center"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Minha Página
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
