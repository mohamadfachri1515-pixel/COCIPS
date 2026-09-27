import React, { useEffect, useState } from 'react';
import { audioManager } from '../services/audioManager';
import { Volume2, VolumeX } from 'lucide-react';

export const MusicToggle: React.FC = () => {
  const [audioState, setAudioState] = useState(audioManager.getSpeakerState());

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    audioManager.toggleMusic();
  };

  const isMuted = audioState.isMuted || !audioState.isPlaying;

  return (
    <button
      onClick={handleToggle}
      className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        !isMuted
          ? 'bg-[#00F2FE]/15 border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:bg-[#00F2FE]/25'
          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
      }`}
      title={!isMuted ? 'Matikan Musik Latar (Speaker OFF)' : 'Nyalakan Musik Latar (Speaker ON)'}
      aria-label="Toggle Background Music"
    >
      {!isMuted ? (
        <>
          <Volume2 className="w-4 h-4 text-[#00F2FE] animate-pulse" />
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider hidden sm:inline">
            SPEAKER ON
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FE] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F2FE]"></span>
          </span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] font-heading font-semibold uppercase tracking-wider hidden sm:inline">
            SPEAKER OFF
          </span>
        </>
      )}
    </button>
  );
};
