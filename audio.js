/**
 * Vocab Arcade - Audio & Speech Synthesis Engine
 * Provides synthesized 8-bit / Arcade sound effects via Web Audio API
 * and multi-language Text-To-Speech (Indonesian & English).
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.synth = window.speechSynthesis;
        this.selectedVoiceId = null;
        this.selectedVoiceEn = null;
        
        // Initialize Speech Voices
        if (this.synth) {
            this.loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
    }

    initAudioContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    loadVoices() {
        const voices = this.synth.getVoices();
        this.selectedVoiceId = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID')) || null;
        this.selectedVoiceEn = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) && !v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en')) || null;
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Play tone with envelope
    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context not allowed or not ready yet
        }
    }

    // Arcade Sound Effects
    playSelect() {
        this.playTone(523.25, 'triangle', 0.08, 0.1); // C5
    }

    playLetterConnect(index = 0) {
        // Pentatonic scale arpeggio
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const freq = scale[Math.min(index, scale.length - 1)];
        this.playTone(freq, 'sine', 0.12, 0.15);
    }

    playWordSuccess() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const now = this.ctx.currentTime;
            const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major
            chords.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                gain.gain.setValueAtTime(0.18, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.25);
            });
        } catch (e) {}
    }

    playBonusWord() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const now = this.ctx.currentTime;
            [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                gain.gain.setValueAtTime(0.08, now + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.18);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.18);
            });
        } catch (e) {}
    }

    playGemCollect() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }

    playError() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.setValueAtTime(130, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }

    playLevelClear() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
            const now = this.ctx.currentTime;
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.2, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.4);
            });
        } catch (e) {}
    }

    playGrandFanfare() {
        if (this.muted) return;
        try {
            this.initAudioContext();
            const notes = [
                { f: 523.25, t: 0, d: 0.15 },
                { f: 523.25, t: 0.15, d: 0.15 },
                { f: 523.25, t: 0.30, d: 0.15 },
                { f: 659.25, t: 0.45, d: 0.35 },
                { f: 783.99, t: 0.80, d: 0.25 },
                { f: 1046.50, t: 1.05, d: 0.7 }
            ];
            const now = this.ctx.currentTime;
            notes.forEach(n => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(n.f, now + n.t);
                gain.gain.setValueAtTime(0.18, now + n.t);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + n.t);
                osc.stop(now + n.t + n.d);
            });
        } catch (e) {}
    }

    // Dynamic Text-To-Speech
    speak(text, lang = 'id') {
        if (this.muted || !this.synth) return;
        this.synth.cancel(); // Stop current speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        if (lang === 'id' || lang === 'id-ID') {
            utterance.lang = 'id-ID';
            if (this.selectedVoiceId) utterance.voice = this.selectedVoiceId;
        } else {
            utterance.lang = 'en-US';
            if (this.selectedVoiceEn) utterance.voice = this.selectedVoiceEn;
        }

        try {
            this.synth.speak(utterance);
        } catch (err) {
            console.warn('SpeechSynthesis error:', err);
        }
    }
}

// Global Sound Instance
const Sound = new SoundEngine();
