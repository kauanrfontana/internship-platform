import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import faq from '@/backend/faq.json';
type FAQ = {
  pergunta: string;
  resposta: string;
};

export function FrequentlyAskedQuestions() {
  const faqs: FAQ[] = faq;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet title="FAQ" />
      <section className="max-w-3xl mx-auto py-20 px-4">
        <h1 className="text-4xl font-semibold mb-10 text-center">Perguntas Frequentes</h1>
        <div className="space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b pb-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left text-xl font-medium focus:outline-none transition-colors duration-200"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.pergunta}
                  <span className="ml-2 text-gray-500">{isOpen ? '−' : '+'}</span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`mt-2 text-gray-600 transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                  }`}
                >
                  <p>{faq.resposta}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
