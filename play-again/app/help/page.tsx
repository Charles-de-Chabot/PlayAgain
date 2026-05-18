import { Header } from "@/components/layout/Header";
import { HelpAccordion } from "@/components/help/HelpAccordion";
import { 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Info, 
  Search,
  MessageSquare
} from "lucide-react";

export default function HelpPage() {
  const sections = [
    {
      title: "Je vends",
      icon: <Tag className="w-6 h-6" />,
      items: [
        {
          title: "Comment publier une annonce ?",
          content: "C'est simple : cliquez sur le bouton '+' dans votre barre de navigation, remplissez les détails de votre article sportif, fixez votre prix et téléchargez vos meilleures photos. Votre annonce sera visible instantanément par toute la communauté."
        },
        {
          title: "Qu'est-ce que la Certification 24h ?",
          content: "Pour garantir la sécurité de tous, notre équipe vérifie chaque nouveau profil sous 24h. Si vous vous inscrivez via Google, la validation est quasi-instantanée car votre identité est déjà confirmée. Un profil certifié inspire plus confiance aux acheteurs !"
        },
        {
          title: "Comment fonctionne l'expédition ?",
          content: "Dès qu'un acheteur paie votre article, vous recevez une notification. Vous n'avez qu'à imprimer le bordereau d'envoi fourni et déposer votre colis. L'argent est conservé par PlayAgain jusqu'à la livraison."
        }
      ]
    },
    {
      title: "J'achète",
      icon: <ShoppingBag className="w-6 h-6" />,
      items: [
        {
          title: "Utiliser le comparateur d'articles",
          content: "Sur chaque fiche produit, vous pouvez voir des articles similaires. Comparez l'état (Neuf, Excellent, Bon...) et le prix pour être sûr de faire le meilleur choix pour votre pratique sportive."
        },
        {
          title: "Comprendre le Score Qualité/Prix",
          content: "Le Score Qualité/Prix est un indicateur intelligent. Il analyse l'état déclaré du produit et le compare à la moyenne des prix pour ce même type d'article déjà vendus sur PlayAgain. Plus le score est élevé, plus l'affaire est excellente !"
        },
        {
          title: "Quelles sont les garanties d'achat ?",
          content: "Sécurité totale : lorsque vous achetez, l'argent n'est pas versé directement au vendeur. Il est bloqué sur un compte de tiers de confiance. Il n'est libéré que lorsque le transporteur confirme la livraison et que vous validez la conformité."
        }
      ]
    },
    {
      title: "Confiance & Sécurité",
      icon: <ShieldCheck className="w-6 h-6" />,
      items: [
        {
          title: "Pourquoi faire confiance aux profils certifiés ?",
          content: "Le badge 'Certifié' signifie que l'utilisateur a passé notre processus de vérification d'identité. C'est un gage de sérieux et de fiabilité pour vos transactions."
        },
        {
          title: "Mes paiements sont-ils sécurisés ?",
          content: "Oui, PlayAgain utilise des protocoles de cryptage de pointe. Vos informations bancaires ne sont jamais stockées sur nos serveurs et les transactions sont protégées contre la fraude."
        },
        {
          title: "Comment signaler un abus ?",
          content: "Si vous remarquez une annonce suspecte ou un comportement inapproprié, cliquez sur 'Signaler' sur le profil ou l'annonce concernée. Notre équipe d'administration interviendra en moins de 12h."
        }
      ]
    },
    {
      title: "À propos de PlayAgain",
      icon: <Info className="w-6 h-6" />,
      items: [
        {
          title: "Notre concept de seconde vie",
          content: "PlayAgain est né d'une passion pour le sport et l'écologie. Notre mission est de prolonger la durée de vie du matériel sportif de qualité en permettant aux sportifs de s'équiper à moindre coût tout en réduisant leur impact environnemental."
        },
        {
          title: "Comment contacter le support ?",
          content: "Besoin d'une assistance personnalisée ? Utilisez le formulaire de contact en bas de cette page. Votre message sera envoyé directement à nos administrateurs qui vous répondront sur votre messagerie PlayAgain."
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-4xl mx-auto px-4 pt-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              CENTRE D'<span className="text-brand-accent">AIDE</span>
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Tout ce que vous devez savoir pour vendre et acheter votre matériel de sport en toute sérénité sur PlayAgain.
            </p>
          </div>

          {/* Search Bar Placeholder Style */}
          <div className="relative mb-12 group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-brand-primary/20 to-brand-accent/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-3xl px-6 py-4 backdrop-blur-xl">
              <Search className="w-6 h-6 text-zinc-500 mr-4" />
              <input 
                type="text" 
                placeholder="Rechercher une question..." 
                className="bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 w-full font-medium"
              />
            </div>
          </div>

          {/* Help Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <HelpAccordion 
                key={idx}
                title={section.title}
                icon={section.icon}
                items={section.items}
              />
            ))}
          </div>

          {/* Support Form Section */}
          <div className="mt-20 bg-linear-to-br from-zinc-900/50 to-black border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center text-black mb-6 shadow-[0_0_20px_rgba(198,255,52,0.3)]">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-4">Encore besoin d'aide ?</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Notre équipe de support est là pour vous accompagner. Envoyez-nous un message et nous vous répondrons sous 12 heures directement sur votre compte.
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Sujet</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-brand-accent transition-colors outline-none" placeholder="Ex: Problème de livraison" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Message</label>
                  <textarea rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-brand-accent transition-colors outline-none resize-none" placeholder="Décrivez votre situation..." />
                </div>
                <button className="w-full py-4 bg-brand-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(198,255,52,0.1)]">
                  Envoyer le message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
