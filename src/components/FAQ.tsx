'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Is this resume matcher free?',
    answer: 'Yes. The MVP is free to use and does not require an account.',
  },
  {
    question: 'Does my resume get uploaded?',
    answer: 'No. The analysis runs in your browser. The app uses localStorage only so your text can stay available on the same device.',
  },
  {
    question: 'Is this an ATS checker?',
    answer: 'It helps you compare resume keywords and skills against a job description, which can support ATS-friendly tailoring. It does not guarantee ATS results or hiring outcomes.',
  },
  {
    question: 'Should I add every missing skill?',
    answer: 'No. Only add skills and experience you can honestly support.',
  },
  {
    question: 'Can I use this for every job application?',
    answer: 'Yes. Paste each job post separately and tailor your resume based on the gaps that matter.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className='space-y-0'>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className='border-b border-[var(--border)] last:border-b-0'
        >
          <button
            type='button'
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className='w-full px-2 py-5 flex items-center justify-between text-left hover:bg-[var(--surface)]/50 -mx-2 px-2 transition-colors'
            aria-expanded={openIndex === index}
          >
            <span className='text-sm font-medium text-[var(--foreground)]'>
              {faq.question}
            </span>
            <svg
              className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 6v12m6-6H6' />
            </svg>
          </button>
          {openIndex === index && (
            <div className='pb-5 -mt-1'>
              <p className='text-sm text-[var(--muted)] leading-relaxed pl-2'>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}