import Link from 'next/link'
import { Camera, Search, Download, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-73px)] relative overflow-hidden bg-white dark:bg-brand-navy">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-brand-blue dark:text-brand-blue-light text-sm font-bold tracking-wide uppercase animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Souvenirs Instantanés · Sénégal
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display text-brand-navy dark:text-white mb-8 leading-[1.05] tracking-tight animate-slide-up">
            Retrouvez vos photos <br/>
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-gold bg-clip-text text-transparent italic font-serif">en un clin d'œil</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:200ms]">
            Notre IA analyse des milliers de photos pour isoler uniquement les vôtres. Simple, rapide et sécurisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up [animation-delay:400ms]">
            <Link 
              href="/user" 
              className="btn-primary px-14 py-6 text-2xl shadow-2xl shadow-brand-blue/30 hover:-translate-y-1.5 active:scale-95 transition-all w-full sm:w-auto"
            >
              Trouver mes photos 🔍
            </Link>
            <Link 
              href="/user" 
              className="btn-secondary px-10 py-6 text-xl border-2 hover:bg-gray-50 dark:hover:bg-brand-navy-light w-full sm:w-auto"
            >
              Parcourir les galeries
            </Link>
          </div>

          {/* Trusted By / Features */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto opacity-60 dark:opacity-40 animate-fade-in [animation-delay:600ms]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Search className="text-brand-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">Face Match IA</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Download className="text-brand-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">HD Download</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <ShieldCheck className="text-brand-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">Sécurisé</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Camera className="text-brand-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">4K Quality</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 dark:bg-brand-navy-light/20 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-navy dark:text-white mb-4">Comment ça marche ?</h2>
              <p className="text-gray-500 dark:text-gray-400">Récupérez vos souvenirs en 3 étapes simples</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: '01',
                  title: 'Choisissez un événement',
                  desc: 'Sélectionnez la soirée, le mariage ou le match auquel vous avez participé.',
                  icon: '📅'
                },
                {
                  step: '02',
                  title: 'Scannez votre visage',
                  desc: 'Prenez un selfie ou importez une photo. Notre IA fait le reste en quelques secondes.',
                  icon: '🤳'
                },
                {
                  step: '03',
                  title: 'Téléchargez vos photos',
                  desc: 'Visualisez vos photos et téléchargez-les instantanément en haute résolution.',
                  icon: '✨'
                }
              ].map((item, i) => (
                <div key={i} className="group relative p-8 bg-white dark:bg-brand-navy rounded-[2rem] shadow-xl shadow-black/5 hover:-translate-y-2 transition-all duration-500">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                  <div className="absolute top-8 right-8 text-4xl font-display font-black opacity-5 group-hover:opacity-10 transition-opacity">{item.step}</div>
                  <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
