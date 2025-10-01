import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const FAQ = () => {
  const faqs = [
    {
      question: "What is Auditron?",
      answer:
        "Auditron is an AI-powered document analysis platform that helps you understand and extract insights from PDFs. Whether you're dealing with insurance policies, contracts, or compliance documents, Auditron makes it easy to chat with your documents and quickly find the information you need.",
    },
    {
      question: "How does document analysis work?",
      answer:
        "Simply upload your PDF document, and Auditron's AI will analyze its content, structure, and key elements. You can then ask natural language questions about the document, search for specific clauses, generate summaries, and get instant insights about important terms and conditions.",
    },
    {
      question: "What types of documents can I analyze?",
      answer:
        "Auditron works with various types of PDF documents, including insurance policies, legal contracts, compliance documents, terms of service, and other structured documents. Our AI is trained to understand and extract information from complex business and legal documents.",
    },
    {
      question: "How accurate is the AI analysis?",
      answer:
        "Our AI uses advanced natural language processing to achieve high accuracy in document analysis. However, we recommend using Auditron as a tool to assist and accelerate your review process, not as a complete replacement for human expertise in critical decision-making.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. All documents are processed with enterprise-grade encryption, and we follow strict data privacy protocols. Your documents are only accessible to you, and we don't store any sensitive information longer than necessary for processing.",
    },
    {
      question: "What kind of insights does Auditron provide?",
      answer:
        "Auditron provides various insights including key clause extraction, term definitions, obligation analysis, exclusion identification, and visual representations of document structure. You can also generate custom reports and summaries based on your specific needs.",
    },
    {
      question: "Is Auditron free to use?",
      answer:
        "Auditron offers a free trial that lets you experience our core features. Our paid plans provide additional features like batch processing, advanced analytics, and team collaboration tools. Contact us for custom enterprise solutions tailored to your organization's needs.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-br from-[#f3eee5] to-[#e2dac9] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-[#251c1a]">
            Common Questions
          </h2>
          <p className="text-[#251c1a]/70 max-w-2xl mx-auto">
            Learn more about how Auditron can help you analyze documents,
            extract insights, and make better decisions faster.
          </p>
        </motion.div>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`border border-[#251c1a]/10 rounded-xl overflow-hidden ${
                openIndex === index
                  ? "bg-gradient-to-r from-[#251c1a] to-[#3c2b26] text-[#f3eee5]"
                  : "bg-[#f3eee5] text-[#251c1a]"
              }`}
            >
              <div
                className={`p-6 cursor-pointer flex justify-between items-center transition-colors duration-300 ${
                  openIndex === index ? "" : "hover:bg-[#251c1a]/5"
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-xl font-semibold pr-8">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 ${
                    openIndex === index ? "text-[#f3eee5]" : "text-[#251c1a]/60"
                  }`}
                >
                  <FaChevronDown />
                </motion.div>
              </div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-[#f3eee5]/90 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Removed Call to Action section with Contact Support button */}
      </div>
    </section>
  );
};

export default FAQ;