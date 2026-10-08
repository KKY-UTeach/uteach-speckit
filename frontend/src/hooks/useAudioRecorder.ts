import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecording {
  blob: Blob;
  url: string;
}

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const accumulatedMillisecondsRef = useRef(0);
  const recordingUrlRef = useRef<string | null>(null);

  const releaseRecording = useCallback(() => {
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }
    setRecording(null);
  }, []);

  const createRecording = useCallback((blob: Blob) => {
    releaseRecording();
    const url = URL.createObjectURL(blob);
    recordingUrlRef.current = url;
    setRecording({ blob, url });
  }, [releaseRecording]);

  const startRecording = useCallback(async () => {
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      accumulatedMillisecondsRef.current = 0;
      setElapsedMilliseconds(0);
      releaseRecording();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || chunksRef.current[0]?.type || 'audio/webm',
        });
        createRecording(blob);
        stream?.getTracks().forEach(track => track.stop());
        if (mediaRecorderRef.current === mediaRecorder) {
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorder.start();
      recordingStartedAtRef.current = performance.now();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      stream?.getTracks().forEach(track => track.stop());
      console.error("Failed to start recording", err);
      alert("Please allow microphone access to record audio.");
    }
  }, [createRecording, releaseRecording]);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      if (recordingStartedAtRef.current !== null) {
        accumulatedMillisecondsRef.current += performance.now() - recordingStartedAtRef.current;
        recordingStartedAtRef.current = null;
      }
      setElapsedMilliseconds(accumulatedMillisecondsRef.current);
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder?.state === 'recording' && recordingStartedAtRef.current !== null) {
      accumulatedMillisecondsRef.current += performance.now() - recordingStartedAtRef.current;
      recordingStartedAtRef.current = null;
      setElapsedMilliseconds(accumulatedMillisecondsRef.current);
      mediaRecorder.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder?.state === 'paused') {
      mediaRecorder.resume();
      recordingStartedAtRef.current = performance.now();
      setIsPaused(false);
    }
  }, []);

  const setAudioFile = useCallback((blob: Blob) => {
    createRecording(blob);
    setElapsedMilliseconds(0);
  }, [createRecording]);

  const clearRecording = useCallback(() => {
    releaseRecording();
    setElapsedMilliseconds(0);
  }, [releaseRecording]);

  useEffect(() => {
    if (!isRecording || isPaused) return undefined;

    const updateElapsedTime = () => {
      const startedAt = recordingStartedAtRef.current;
      if (startedAt !== null) {
        setElapsedMilliseconds(
          accumulatedMillisecondsRef.current + performance.now() - startedAt,
        );
      }
    };

    const intervalId = window.setInterval(updateElapsedTime, 250);
    return () => window.clearInterval(intervalId);
  }, [isRecording, isPaused]);

  useEffect(() => () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    }
    mediaRecorder?.stream.getTracks().forEach(track => track.stop());
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
  }, []);

  return { 
    isRecording, 
    isPaused,
    elapsedMilliseconds,
    recording, 
    startRecording, 
    stopRecording, 
    pauseRecording,
    resumeRecording,
    clearRecording,
    setAudioFile,
  };
};
