import { useState } from "react";
import { Nav } from "@/components/ui/nav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const Contact = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulação de envio
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Mensagem enviada com sucesso! Entraremos em contato em breve.",
      );
      setFormData({
        nome: "",
        email: "",
        assunto: "",
        mensagem: "",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <section>
            <h1 className="text-4xl font-bold mb-6">Contato</h1>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <section>
            <h2 className="text-3xl font-bold mb-4">Entre em Contato</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <ScrollReveal delay={200}>
                <div>
                  <p className="text-foreground/80 mb-8">
                    Estamos aqui para ajudar! Se você tem dúvidas sobre nossos
                    produtos, precisa de suporte técnico ou quer saber mais
                    sobre como o Noma pode beneficiar seu negócio, preencha o
                    formulário ou use um de nossos canais de contato direto.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">E-mail</h3>
                        <p className="text-foreground/70">
                          contato@zencora.com
                        </p>
                        <p className="text-foreground/70">
                          suporte@zencora.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Telefone</h3>
                        <p className="text-foreground/70">(11) 4002-8922</p>
                        <p className="text-foreground/70">
                          Segunda a Sexta, 9h às 18h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Endereço</h3>
                        <p className="text-foreground/70">
                          Av. Paulista, 1000 - Bela Vista
                        </p>
                        <p className="text-foreground/70">
                          São Paulo - SP, 01310-100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 bg-background border rounded-xl p-6 shadow-sm"
                  >
                    <div>
                      <label
                        htmlFor="nome"
                        className="block text-sm font-medium mb-1"
                      >
                        Seu nome
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-md bg-background"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                      >
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-md bg-background"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="assunto"
                        className="block text-sm font-medium mb-1"
                      >
                        Assunto
                      </label>
                      <select
                        id="assunto"
                        name="assunto"
                        value={formData.assunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-md bg-background"
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="Suporte">Suporte Técnico</option>
                        <option value="Vendas">Informações sobre Planos</option>
                        <option value="Parcerias">Parcerias</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mensagem"
                        className="block text-sm font-medium mb-1"
                      >
                        Mensagem
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        rows={5}
                        value={formData.mensagem}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-md bg-background resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" /> Enviar mensagem
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <section>
            <h2 className="text-3xl font-bold mb-4">Redes Sociais</h2>
            <div className="mt-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
              <p className="text-foreground/80 max-w-2xl mx-auto mb-6">
                Siga-nos nas redes sociais para novidades, dicas e atualizações
                sobre o Noma e outras soluções da Zencora.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="bg-background w-12 h-12 rounded-full flex items-center justify-center border hover:border-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-background w-12 h-12 rounded-full flex items-center justify-center border hover:border-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-background w-12 h-12 rounded-full flex items-center justify-center border hover:border-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5932 15.1514 13.8416 15.5297C13.0901 15.9079 12.2385 16.0396 11.4078 15.9059C10.5771 15.7723 9.80977 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.5 6.5H17.51"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-background w-12 h-12 rounded-full flex items-center justify-center border hover:border-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 9H2V21H6V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-background w-12 h-12 rounded-full flex items-center justify-center border hover:border-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14531 8.20556 0.991235 9.97631 1 11.75C0.988786 13.537 1.14285 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8571 8.1787 22.54 6.42Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <section>
            <h2 className="text-3xl font-bold mb-4">Localização</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <ScrollReveal delay={600}>
                <div>
                  <p className="text-foreground/80 mb-8">
                    Av. Paulista, 1000 - Bela Vista
                  </p>
                  <p className="text-foreground/80 mb-8">
                    São Paulo - SP, 01310-100
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={700}>
                <div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197322500484!2d-46.65342722448944!3d-23.56461122847335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a2b2ed7f3a1%3A0xab35da2f5ca62674!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1spt-BR!2sbr!4v1682344800000!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <ScrollReveal delay={800}>
        <footer>
          <Footer />
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default Contact;
