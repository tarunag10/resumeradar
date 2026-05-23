import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://resumeradar-app.vercel.app'),
  title: 'Free Resume Matcher | Match Your Resume to a Job Post',
  description: 'Paste your resume and a job post to get a private match score, keyword overlap, missing skills, repeated phrases, and suggested bullets. No upload or login.',
  keywords: [
    'resume matcher',
    'resume job description matcher',
    'resume keyword matcher',
    'job description keyword matcher',
    'resume match score',
    'ATS resume checker',
    'resume scanner',
    'keyword checker free',
  ],
  authors: [{ name: 'ResumeRadar' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Free Private Resume Matcher',
    description: 'Compare your resume with any job post in seconds. Find missing skills, keyword overlap, repeated phrases, and better resume bullet ideas.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Private Resume Matcher',
    description: 'Compare your resume with any job post in seconds. Find missing skills, keyword overlap, repeated phrases, and better resume bullet ideas.',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-full'>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className='min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] antialiased'>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
