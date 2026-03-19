import { Link, useNavigate } from 'react-router-dom';
import { User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Zap, Clock, Smartphone, CheckCircle2 } from 'lucide-react';

export default function Home({ user }: { user: User | null }) {
  const navigate = useNavigate();

  const handleStart = async () => {
    if (user) {
      navigate('/create');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      
      const userRef = doc(db, 'users', newUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: newUser.uid,
          email: newUser.email,
          name: newUser.displayName,
          createdAt: serverTimestamp(),
        });
      }
      navigate('/create');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
          >
            Venda seus serviços online em <span className="text-indigo-600">menos de 1 minuto</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-10"
          >
            Crie uma página profissional, otimizada por Inteligência Artificial, apenas respondendo 3 perguntas. Ideal para freelancers, autônomos e vendedores do WhatsApp.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Criar Minha Página Agora
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Como funciona o PáginaJá?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Responda 3 perguntas</h3>
              <p className="text-gray-500">Diga o que você faz, como funciona e quanto custa. É só isso.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">A IA faz a mágica</h3>
              <p className="text-gray-500">Nossa Inteligência Artificial cria um título chamativo e uma descrição que vende.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compartilhe o link</h3>
              <p className="text-gray-500">Sua página está pronta! Envie o link no WhatsApp ou coloque na bio do Instagram.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Por que usar o PáginaJá?</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600 h-fit">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sem conhecimento técnico</h4>
                  <p className="text-gray-500">Você não precisa saber programar ou usar ferramentas complexas de design.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600 h-fit">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Extremamente rápido</h4>
                  <p className="text-gray-500">Sua página fica pronta em menos de 1 minuto. Tempo é dinheiro.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-green-100 p-1 rounded-full text-green-600 h-fit">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Foco no WhatsApp</h4>
                  <p className="text-gray-500">Botão direto para o seu WhatsApp, facilitando o fechamento da venda.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border border-indigo-100">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-6 animate-pulse"></div>
              <div className="h-12 bg-green-500 rounded-xl w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
