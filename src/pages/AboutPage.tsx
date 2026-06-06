import { Mail, Github, Shield, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">À propos</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Inco-Info</h2>
              <p className="text-xs text-gray-500">Revue de presse critique</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Inco-Info analyse en continu les grands médias mondiaux pour détecter les omissions,
            divergences, incohérences et silences dans le traitement de l&apos;information. L&apos;objectif :
            donner aux lecteurs les outils pour comprendre <em>comment</em> l&apos;information est construite,
            pas seulement <em>ce qu&apos;elle dit</em>.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" /> Méthodologie
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-bold text-red-600 flex-shrink-0">OMISSION</span>
              <span>Un fait documenté absent de la majorité des sources du corpus.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-amber-600 flex-shrink-0">DIVERGENCE</span>
              <span>Des sources couvrant le même fait avec des angles et conclusions contradictoires.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-violet-600 flex-shrink-0">INCOHÉRENCE</span>
              <span>Une même source contredisant ses propres affirmations récentes.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-gray-600 flex-shrink-0">SILENCE</span>
              <span>Un événement ignoré par l&apos;ensemble des sources sur une période significative.</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Mail size={16} className="text-blue-600" /> Contact
          </h3>
          <a href="mailto:contact@inco-info.fr" className="text-sm text-blue-600 hover:underline font-medium">
            contact@inco-info.fr
          </a>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Github size={16} /> Open Source
          </h3>
          <p className="text-sm text-gray-500">Ce projet est open source. Contributions bienvenues.</p>
        </div>
      </div>
    </div>
  );
}
