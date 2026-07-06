import { ArrowRight, Terminal, Lock, Unlock, Cpu, Compass } from 'lucide-react';
import { NavLink } from '../types';
import { useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface SectionOverlayProps {
  activeChapter: number;
  setActiveChapter: (index: number) => void;
  preloaderComplete: boolean;
}

export default function SectionOverlay({ 
  activeChapter, 
  setActiveChapter,
  preloaderComplete
}: SectionOverlayProps) {
  const [activationStatus, setActivationStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

  const navigationLinks: NavLink[] = [
    { label: 'ARCHIVE', href: '#archive' },
    { label: 'CHRONICLES', href: '#chronicles' },
    { label: 'FACTIONS', href: '#factions' },
    { label: 'TRANSMISSION', href: '#transmission' },
  ];

  // Define structured chapter contents matching the exact Future Samurai lore
  const chapters = [
    {
      number: '01',
      title: 'HISTORY OF FUTURE',
      subtitle: 'CHRONICLES OF NEOMODERN BUSHIDO',
      paragraph: 'In the neo-plaster ruins of a cyber metropolis, the ancient way of the warrior merges with state fabrication. Raw code binds biological steel.',
      ctaLabel: 'ENTER RELIQUARY',
      icon: <Compass className="w-4 h-4 text-black" />
    },
    {
      number: '02',
      title: 'CRIMSON SYNTHESIS',
      subtitle: 'THE SPLATTER MATRIX',
      paragraph: 'The stark crimson brush stroke behind our synthetic shogun represents the last volatile carbon essence trying to rupture static mechanical structures.',
      ctaLabel: 'RETUNE FREQUENCY',
      icon: <Cpu className="w-4 h-4 text-black" />
    },
    {
      number: '03',
      title: 'KABUTO NETS',
      subtitle: 'NEURAL LINK INTERFACE',
      paragraph: 'Model K-98 features 3D dynamic mesh dispersion, micro-welded titanium composite crests, and automated bio-respirators for absolute cerebral shell defense.',
      ctaLabel: 'ENGAGE INJECTORS',
      icon: <Terminal className="w-4 h-4 text-black" />
    },
    {
      number: '04',
      title: 'RELIQUARY VAULT',
      subtitle: 'SECURE ARCHIVAL CLEARANCE',
      paragraph: 'Submit node validation. Verified neural keys are allocated within the Imperial Shogunate records for immediate database synchronization code access.',
      ctaLabel: 'DECRYPT ARCHIVE',
      icon: <Lock className="w-4 h-4 text-black" />
    }
  ];

  const [displayedChapterIdx, setDisplayedChapterIdx] = useState(activeChapter);
  const currentChapter = chapters[displayedChapterIdx] || chapters[0];

  // Helper to split chapter title for layout: top line (black), bottom line (crimson red)
  const splitTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 1) return { line1: title, line2: '' };
    const line2 = words[words.length - 1];
    const line1 = words.slice(0, words.length - 1).join(' ');
    return { line1, line2 };
  };

  const { line1, line2 } = splitTitle(currentChapter.title);

  // Reset internal CTA status when chapter transforms
  useEffect(() => {
    setActivationStatus('IDLE');
  }, [displayedChapterIdx]);

  // Initial reveal of chapter 0 when the preloader ends
  useEffect(() => {
    if (!preloaderComplete || displayedChapterIdx !== 0) return;

    const ids = ['history', 'future', 'subtitle', 'paragraph', 'button'];
    
    // Reset to hidden initially
    ids.forEach(id => {
      const el = document.getElementById(`matrix-${id}`);
      if (el) {
        el.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18');
      }
    });

    const tl = gsap.timeline();

    tl.to('#matrix-history', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
      duration: 0.5,
      ease: 'power1.inOut'
    }, 0.4);

    tl.to('#matrix-future', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
      duration: 0.5,
      ease: 'power1.inOut'
    }, 1.2);

    tl.to('#matrix-subtitle', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
      duration: 0.5,
      ease: 'power1.inOut'
    }, 2.0);

    tl.to('#matrix-paragraph', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
      duration: 0.5,
      ease: 'power1.inOut'
    }, 2.8);

    tl.to('#matrix-button', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
      duration: 0.5,
      ease: 'power1.inOut'
    }, 3.6);

    return () => {
      tl.kill();
    };
  }, [preloaderComplete]);

  // Handle activeChapter transition with organic sumi-e text dissolve and reveal cascade
  useEffect(() => {
    // Skip if it's the initial boot or matches what's currently rendered
    if (activeChapter === displayedChapterIdx) return;

    const ids = ['history', 'future', 'subtitle', 'paragraph', 'button'];

    // Create a timeline to dissolve the currently visible text
    const dissolveTl = gsap.timeline({
      onComplete: () => {
        // Update state to render the new chapter's text content
        setDisplayedChapterIdx(activeChapter);

        // Immediately start revealing the new text organically
        const revealTl = gsap.timeline();

        // 1. Reset all SVG filter thresholds to fully dissolved (-18)
        ids.forEach(id => {
          const el = document.getElementById(`matrix-${id}`);
          if (el) {
            el.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18');
          }
        });

        // 2. Cascade reveal new text segments
        revealTl.to('#matrix-history', {
          attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
          duration: 0.25,
          ease: 'power1.inOut'
        }, 0.0);

        revealTl.to('#matrix-future', {
          attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
          duration: 0.25,
          ease: 'power1.inOut'
        }, 0.04);

        revealTl.to('#matrix-subtitle', {
          attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
          duration: 0.25,
          ease: 'power1.inOut'
        }, 0.08);

        revealTl.to('#matrix-paragraph', {
          attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
          duration: 0.25,
          ease: 'power1.inOut'
        }, 0.12);

        revealTl.to('#matrix-button', {
          attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 2' },
          duration: 0.25,
          ease: 'power1.inOut'
        }, 0.16);
      }
    });

    // Dissolve existing text in a reverse cascade order (button dissolves first, up to title)
    dissolveTl.to('#matrix-button', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18' },
      duration: 0.12,
      ease: 'power1.inOut'
    }, 0.0);

    dissolveTl.to('#matrix-paragraph', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18' },
      duration: 0.12,
      ease: 'power1.inOut'
    }, 0.02);

    dissolveTl.to('#matrix-subtitle', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18' },
      duration: 0.12,
      ease: 'power1.inOut'
    }, 0.04);

    dissolveTl.to('#matrix-future', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18' },
      duration: 0.12,
      ease: 'power1.inOut'
    }, 0.06);

    dissolveTl.to('#matrix-history', {
      attr: { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -18' },
      duration: 0.12,
      ease: 'power1.inOut'
    }, 0.08);

    return () => {
      dissolveTl.kill();
    };
  }, [activeChapter, displayedChapterIdx]);

  const handleCtaAction = () => {
    if (activationStatus !== 'IDLE') return;
    setActivationStatus('LOADING');
    setTimeout(() => {
      setActivationStatus('SUCCESS');
    }, 1800);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none w-full h-full flex flex-col justify-between p-3 md:px-[2.5%] md:py-[1.5%] select-none">
      
      {/* 1. TOP MARGIN BAR */}
      <div className="w-full flex items-start justify-between pointer-events-auto z-40">
        {/* Brand Logo: Premium Japanese Poster Style */}
        <div className="flex flex-col items-start select-none">
          <div 
            className="flex items-center group/logo cursor-pointer"
            onClick={() => setActiveChapter(0)}
          >
            <div 
              id="brand-logo"
              className="font-serif font-black text-3xl tracking-[0.12em] text-black group-hover/logo:opacity-75 group-hover/logo:scale-[1.02] group-hover/logo:-translate-y-[1px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none leading-none inline-block"
            >
              SAMURAI
            </div>
            {/* Hanko Stamp */}
            <div 
              className="border-[2px] border-[#b00c14] text-[#b00c14] px-1 py-0.5 ml-2.5 font-bold uppercase select-none tracking-tighter rotate-[-3deg] inline-block text-[10px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/logo:rotate-[5deg] group-hover/logo:scale-105"
              style={{ fontFamily: 'sans-serif', lineHeight: '1' }}
            >
              侍
            </div>
          </div>
          <div className="w-[170px] h-[1.5px] bg-black mt-1" />
          <div className="font-mono text-[7.5px] text-black/75 tracking-[0.34em] mt-1.5 flex items-center uppercase font-bold leading-none">
            THE ANCIENT WAY REMAINS.
            <span className="w-[3px] h-[3px] bg-[#b00c14] rounded-full ml-1.5" />
            <span className="w-[3px] h-[3px] bg-[#b00c14] rounded-full ml-0.5" />
          </div>
        </div>

        {/* Minimal navigation links - mapped directly to change chapters */}
        <nav className="flex items-center space-x-6 sm:space-x-8 pt-2">
          {navigationLinks.map((link, idx) => (
            <button
              key={link.label}
              onClick={() => setActiveChapter(idx % chapters.length)}
              className={`group relative py-1.5 text-[11px] font-mono tracking-[0.26em] uppercase transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none cursor-pointer hover:-translate-y-[1px] ${
                activeChapter === idx 
                  ? 'text-black font-bold scale-[1.03]' 
                  : 'text-black/30 hover:text-black/70 font-medium hover:scale-[1.02]'
              }`}
            >
              <span className="relative z-10 block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {link.label}
              </span>
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeChapter === idx ? 'w-full bg-[#b00c14]' : 'w-0 bg-black group-hover:w-full'
              }`} />
            </button>
          ))}
        </nav>
      </div>

      {/* 2. MIDDLE AREA (Strictly dead space for high-fidelity 3D layer) */}
      <div className="flex-1 w-full" />

      {/* 3. BOTTOM ROW: LEFT SIDE TEXT COLUMN & FAR-RIGHT NAVIGATION STRIP */}
      <div className="w-full flex items-end justify-between z-40">
        
        {/* LEFT COLUMN: Wider Width to accommodate poster titles, absolute pin */}
        <div className="w-full md:w-[35%] max-w-[360px] flex flex-col items-start pointer-events-auto text-left py-2">
          
          {/* Chapter Metadata Badge - Poster Style */}
          <div 
            key={`meta-${displayedChapterIdx}`}
            className="flex flex-col mb-4.5 space-y-0.5 select-none font-mono text-[9px] tracking-[0.2em] text-black/85 font-bold uppercase"
          >
            <div className="flex items-center space-x-1.5 leading-none">
              <span>①</span>
              <span>CHAPTER_{currentChapter.number} // 🜏 881012 P2</span>
            </div>
            <div className="flex items-center space-x-1.5 leading-none pl-[13px] text-black/55">
              <span>②</span>
              <span>SECURE_ARCHIVE // CL_{currentChapter.number}</span>
            </div>
          </div>

          {/* Title rendered in high contrast clean futuristic display typography */}
          <h1 
            key={`title-${displayedChapterIdx}`}
            className="font-futuristic tracking-normal leading-[1.0] text-black uppercase select-none mb-6 flex flex-col items-start"
          >
            <span 
              className="text-black text-[1.68rem] sm:text-[2.13rem] md:text-[2.46rem] font-bold tracking-[0.02em] inline-block"
              style={{ filter: 'url(#ink-reveal-history)' }}
            >
              {line1}
            </span>
            {line2 && (
              <span 
                className="text-[#b00c14] text-[3.45rem] sm:text-[4.32rem] md:text-[4.97rem] font-extrabold tracking-[0.01em] mt-1 inline-block"
                style={{ filter: 'url(#ink-reveal-future)' }}
              >
                {line2}
              </span>
            )}
          </h1>

          {/* Subtitle with a thick red indicator underline */}
          <div 
            key={`sub-${displayedChapterIdx}`}
            className="font-mono text-[12px] sm:text-[13px] text-black tracking-[0.24em] mb-8 uppercase font-bold relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-[#b00c14] after:mt-3"
            style={{ filter: 'url(#ink-reveal-subtitle)' }}
          >
            {currentChapter.subtitle}
          </div>

          {/* Description Paragraph with elegant serif feel */}
          <p 
            key={`para-${displayedChapterIdx}`}
            className="font-sans text-[15px] sm:text-[17.5px] md:text-[20px] font-bold text-[#1a1a1a] tracking-normal leading-[1.9] mb-8"
            style={{ filter: 'url(#ink-reveal-paragraph)', opacity: 1 }}
          >
            {currentChapter.paragraph}
            <span className="text-[#b00c14] ml-0.5 animate-pulse font-bold">|</span>
          </p>

          {/* Interactive CTA button - Premium luxury button with inner ring borders and hover effect */}
          <div className="w-full relative" style={{ filter: 'url(#ink-reveal-button)' }}>
            <button
              onClick={handleCtaAction}
              disabled={activationStatus === 'LOADING'}
              className="group relative flex items-center justify-center space-x-3 bg-black text-white px-6 py-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-none w-full border border-white/10 hover:border-white/30 hover:scale-[1.01] hover:-translate-y-[2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] active:scale-[0.98] active:translate-y-[0px] cursor-pointer"
            >
              {/* Double border / fine inset detail */}
              <span className="absolute inset-[1px] border border-white/5 pointer-events-none group-hover:border-white/12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              
              {activationStatus === 'IDLE' && (
                <>
                  <span className="font-futuristic text-[11px] sm:text-[12px] tracking-[0.26em] text-white uppercase font-bold z-10 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white">
                    {currentChapter.ctaLabel}
                  </span>
                  <span className="text-[#b00c14] font-futuristic font-black text-sm z-10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">→</span>
                </>
              )}

              {activationStatus === 'LOADING' && (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mr-1 z-10" />
                  <span className="font-futuristic text-[10px] tracking-[0.18em] text-white/80 uppercase font-bold z-10">
                    RESOLVING_CRYPT...
                  </span>
                </>
              )}

              {activationStatus === 'SUCCESS' && (
                <>
                  <Unlock className="w-3.5 h-3.5 text-[#b00c14] mr-1 z-10" />
                  <span className="font-futuristic text-[11px] sm:text-[12px] tracking-[0.26em] text-white uppercase font-bold z-10">
                    {currentChapter.ctaLabel}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Left Warning Details */}
          <div className="flex items-center space-x-2 mt-7 select-none opacity-90">
            <svg className="w-3.5 h-3.5 text-[#b00c14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-mono text-[7.5px] text-[#b00c14] tracking-[0.25em] uppercase font-bold leading-none">
                SYS_ARCHIVE_00{currentChapter.number}
              </span>
              <span className="font-mono text-[6.5px] text-black/60 tracking-[0.2em] uppercase font-bold mt-0.5 leading-none">
                AUTHORIZED ACCESS ONLY
              </span>
            </div>
          </div>
        </div>

        {/* FAR-RIGHT EDGE: Chronology Vertical Navigation Strip Pinned to Margin */}
        <div className="flex flex-col items-center space-y-6 pointer-events-auto h-auto">
          <span className="font-mono text-[9px] text-black/70 tracking-[0.28em] [writing-mode:vertical-lr] uppercase select-none font-bold">
            Chronology
          </span>
          
          <div className="flex flex-col items-center space-y-4">
            {['01', '02', '03', '04'].map((num, idx) => (
              <button
                key={num}
                onClick={() => setActiveChapter(idx)}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
              >
                <span 
                  className={`font-mono text-[10px] tracking-wider transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[1px] ${
                    activeChapter === idx 
                      ? 'text-[#b00c14] font-bold scale-110' 
                      : 'text-black/18 hover:text-black/50 hover:scale-105'
                  }`}
                  style={activeChapter === idx ? { textShadow: '0 0 8px rgba(176, 12, 20, 0.3)' } : undefined}
                >
                  {num}
                </span>
                
                {/* Active indicator dot with pulse ring */}
                <div 
                  className={`mt-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeChapter === idx 
                      ? 'w-2 h-2 bg-[#b00c14] scale-125' 
                      : 'w-1.5 h-1.5 bg-black/12 group-hover:bg-black/35 group-hover:scale-110'
                  }`}
                  style={activeChapter === idx ? { boxShadow: '0 0 0 3px rgba(176, 12, 20, 0.15), 0 0 6px rgba(176, 12, 20, 0.2)' } : undefined}
                />
              </button>
            ))}
          </div>

          {/* Elegant active progress rail vertical tracking line */}
          <div className="w-[1.5px] h-14 bg-black/8 relative">
            <div 
              className="absolute left-0 w-full bg-[#b00c14] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ 
                height: '25%',
                transform: `translateY(${activeChapter * 300}%)`,
                boxShadow: '0 0 4px rgba(176, 12, 20, 0.35)'
              }}
            />
          </div>
        </div>

      {/* Organic Ink Reveal SVG Filters */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          {['history', 'future', 'subtitle', 'paragraph', 'button'].map(id => (
            <filter key={id} id={`ink-reveal-${id}`} x="-10%" y="-10%" width="120%" height="120%">
              {/* Generate high-detail fractal noise for paper/ink fibers */}
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
              
              {/* Animate threshold using feColorMatrix */}
              <feColorMatrix
                id={`matrix-${id}`}
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 18 -18"
                result="mask"
              />
              
              {/* Displace the text outlines using the noise for bleeding ink edges */}
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              
              {/* Mask the displaced text using the animated color matrix threshold */}
              <feComposite operator="in" in="displaced" in2="mask" />
            </filter>
          ))}
        </defs>
      </svg>
      
      </div>

    </div>
  );
}
