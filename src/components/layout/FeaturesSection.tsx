
import { useEffect, useRef } from "react";
import { 
  ClipboardList, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Moon, 
  Shield 
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div className={`reveal delay-[${delay}] bg-card hover:bg-card/80 border rounded-xl p-6 transition-all duration-300 hover:shadow-md`}>
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    const section = sectionRef.current;
    if (section) {
      const elements = section.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));
    }
    
    return () => {
      if (section) {
        const elements = section.querySelectorAll('.reveal');
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  const features = [
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Cadastro rápido de encomendas",
      description: "Adicione pedidos em poucos segundos e acompanhe o progresso com clareza.",
      delay: "100ms"
    },
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Painel de produção",
      description: "Organize sua produção diária com listas simples e colaborativas.",
      delay: "200ms"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Relatórios de faturamento",
      description: "Visualize seus ganhos e produtividade com gráficos intuitivos.",
      delay: "300ms"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multiusuário",
      description: "Adicione colaboradores e compartilhe tarefas facilmente.",
      delay: "400ms"
    },
    {
      icon: <Moon className="h-6 w-6" />,
      title: "Modo escuro automático",
      description: "Uma experiência adaptável ao seu ambiente e preferências.",
      delay: "500ms"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Integração com conta Zencora",
      description: "Gerencie tudo com uma conta única e segura.",
      delay: "600ms"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className=" py-16 md:py-24 relative" 
      id="features" // Updated ID to match navigation links
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-12">
          <h2 className="reveal text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades que fazem a diferença
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-secondary/10 rounded-full filter blur-[120px] -z-10"></div>
    </section>
  );
}
