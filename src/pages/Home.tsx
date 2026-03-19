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
    <div className="bg-[#f5f5f0]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-editorial">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#1c1c1a] leading-[0.9] tracking-tight mb-8"
          >
            Venda <span className="italic opacity-80">mais</span>,<br />
            trabalhe <span className="italic opacity-80">menos.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[#1c1c1a]/60 max-w-2xl mx-auto mb-12 font-light"
          >
            Crie uma página profissional e artesanal para seus serviços em menos de um minuto. Perfeito para autônomos e freelancers.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <button
              onClick={handleStart}
              className="bg-[#1c1c1a] text-[#f5f5f0] px-10 py-5 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-medium transition-transform hover:scale-105"
            >
              Criar Minha Página
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="py-32 border-b border-editorial">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-16 md:gap-8">
            <div className="text-center md:text-left">
              <span className="font-serif text-5xl text-[#1c1c1a]/20 block mb-6">01</span>
              <h3 className="text-2xl font-serif text-[#1c1c1a] mb-4">Responda</h3>
              <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Diga o que você faz, como funciona e quanto custa. É só isso.</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-serif text-5xl text-[#1c1c1a]/20 block mb-6">02</span>
              <h3 className="text-2xl font-serif text-[#1c1c1a] mb-4">Aguarde</h3>
              <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Nossa tecnologia cria um título chamativo e uma descrição que vende.</p>
            </div>
            <div className="text-center md:text-left">
              <span className="font-serif text-5xl text-[#1c1c1a]/20 block mb-6">03</span>
              <h3 className="text-2xl font-serif text-[#1c1c1a] mb-4">Compartilhe</h3>
              <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Sua página está pronta. Envie o link no WhatsApp ou coloque no Instagram.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-serif text-[#1c1c1a] mb-12 leading-tight">
              Por que usar o <span className="italic">PáginaJá?</span>
            </h2>
            <ul className="space-y-10">
              <li className="flex gap-6 items-start">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-[#1c1c1a]/40" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-[#1c1c1a] mb-2">Sem conhecimento técnico</h4>
                  <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Você não precisa saber programar ou usar ferramentas complexas de design.</p>
                </div>
              </li>
              <li className="flex gap-6 items-start">
                <div className="mt-1">
                  <Clock className="w-6 h-6 text-[#1c1c1a]/40" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-[#1c1c1a] mb-2">Extremamente rápido</h4>
                  <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Sua página fica pronta em menos de 1 minuto. Tempo é dinheiro.</p>
                </div>
              </li>
              <li className="flex gap-6 items-start">
                <div className="mt-1">
                  <Smartphone className="w-6 h-6 text-[#1c1c1a]/40" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-[#1c1c1a] mb-2">Foco no WhatsApp</h4>
                  <p className="text-[#1c1c1a]/60 font-light leading-relaxed">Botão direto para o seu WhatsApp, facilitando o fechamento da venda.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[3/4] bg-[#1c1c1a] rounded-full overflow-hidden p-8 flex flex-col justify-center text-center">
              <div className="w-full h-32 bg-[#f5f5f0]/10 rounded-full mb-8 animate-pulse"></div>
              <div className="h-6 bg-[#f5f5f0]/20 rounded-full w-3/4 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-[#f5f5f0]/10 rounded-full w-full mb-3 animate-pulse"></div>
              <div className="h-4 bg-[#f5f5f0]/10 rounded-full w-5/6 mx-auto mb-8 animate-pulse"></div>
              <div className="h-14 bg-[#f5f5f0] rounded-full w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
