import { useState, useCallback, useRef } from 'react';
import { textToSpeech } from '../services/geminiService';

// Decoding functions from guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                 audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
        }
        return audioContextRef.current;
    }, []);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const speak = useCallback(async (text: string) => {
        const audioContext = getAudioContext();
        if (!audioContext) {
            alert("Your browser does not support AudioContext.");
            return;
        }

        if (isSpeaking) {
            stop();
        }

        setIsLoading(true);
        setIsSpeaking(false);

        try {
            // Sanitize text to remove potential markdown characters that can cause TTS errors
            const sanitizedText = text.replace(/[*_#`]/g, '');
            const base64Audio = await textToSpeech(sanitizedText);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
                setIsSpeaking(false);
                sourceRef.current = null;
            };

            source.start();
            sourceRef.current = source;
            setIsSpeaking(true);

        } catch (error) {
            console.error("Failed to play audio:", error);
            alert("Sorry, text-to-speech is currently unavailable.");
        } finally {
            setIsLoading(false);
        }
    }, [getAudioContext, isSpeaking, stop]);
    

    return { isSpeaking, isLoading, speak, stop };
};