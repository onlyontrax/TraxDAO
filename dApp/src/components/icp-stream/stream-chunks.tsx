/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/function-component-definition */
import React, { useEffect, useRef, useState } from 'react';

interface StreamingFileProps {
  fileChunks: Blob[];
}

export const StreamingFile: React.FC<StreamingFileProps> = ({ fileChunks }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const streamFileData = async () => {
      const readableStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for (const chunk of fileChunks) {
              const arrayBuffer = await chunk.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              controller.enqueue(uint8Array);
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      if (isVideo && videoRef.current) {
        const response = new Response(readableStream);
        const blob = await response.blob();
        const videoURL = URL.createObjectURL(blob);
        videoRef.current.src = videoURL;
      } else if (!isVideo && audioRef.current) {
        const response = new Response(readableStream);
        const blob = await response.blob();
        const audioURL = URL.createObjectURL(blob);
        audioRef.current.src = audioURL;
      }
    };

    streamFileData();
  }, [fileChunks, isVideo]);

  const handleSwitchType = () => {
    setIsVideo((prevIsVideo) => !prevIsVideo);
  };

  if (isVideo) {
    return (
      <div>
        <video ref={videoRef} controls autoPlay />
        <button type="button" onClick={handleSwitchType}>Switch to Audio</button>
      </div>
    );
  }
  return (
    <div>
      <audio ref={audioRef} controls autoPlay />
      <button type="button" onClick={handleSwitchType}>Switch to Video</button>
    </div>
  );
};
