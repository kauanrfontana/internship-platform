import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

type FAQ = {
  question: string;
  answer: string;
};

export function FrequentlyAskedQuestions() {
  const faqs: FAQ[] = [
    { question: 'Questão 1', answer: 'Resposta 1' },
    { question: 'Questão 2', answer: 'Resposta 2' },
    { question: 'Questão 3', answer: 'Resposta 3' },
    { question: 'Questão 4', answer: 'Resposta 4' }, 
  ];

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
                  {faq.question}
                  <span className="ml-2 text-gray-500">{isOpen ? '−' : '+'}</span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`mt-2 text-gray-600 transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
