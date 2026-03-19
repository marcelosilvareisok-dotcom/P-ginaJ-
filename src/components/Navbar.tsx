import { Link } from 'react-router-dom';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user }: { user: User | null }) {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <nav className="border-b border-editorial sticky top-0 z-40 bg-[#f5f5f0]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif italic text-2xl tracking-tight text-[#1c1c1a] group-hover:opacity-70 transition-opacity">PáginaJá.</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-[#1c1c1a] hover:opacity-70 font-medium flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut(auth)}
                  className="text-[#1c1c1a]/60 hover:text-[#1c1c1a] flex items-center gap-2 text-sm p-2 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="border border-[#1c1c1a] text-[#1c1c1a] hover:bg-[#1c1c1a] hover:text-[#f5f5f0] px-6 py-2.5 rounded-full font-medium text-xs uppercase tracking-widest transition-all"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
