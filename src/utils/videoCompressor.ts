/**
 * Video Compressor Utility using HTML5 Canvas & MediaRecorder API.
 * Compresses raw high-bitrate phone videos (e.g. 100MB 4K/1080p recordings)
 * down to ~2MB-8MB (720p/1080p HD at ~1.5Mbps) without noticeable visual quality loss.
 */

export interface VideoCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  targetBitrate?: number; // default 1,500,000 (1.5 Mbps)
  fps?: number; // default 30
}

export interface VideoCompressionResult {
  compressedFile: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export async function compressVideo(
  file: File,
  options: VideoCompressionOptions = {},
  onProgress?: (progressPercent: number) => void
): Promise<VideoCompressionResult> {
  const originalSize = file.size;
  const {
    maxWidth = 1280,
    maxHeight = 720,
    targetBitrate = 1500000, // 1.5 Mbps produces crisp HD quality with small size
    fps = 30
  } = options;

  // If video is already tiny (< 2MB) or not a video file, return original
  if (!file.type.startsWith("video/") || originalSize < 2 * 1024 * 1024) {
    return {
      compressedFile: file,
      previewUrl: URL.createObjectURL(file),
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0
    };
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true; // Required to ensure autoplay & frame rendering without user interaction lock
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.onloadedmetadata = async () => {
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;
      const duration = video.duration || 1;

      // Calculate target aspect-ratio bounding box
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Make dimensions even numbers (required by codecs)
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        cleanup();
        resolve(fallbackResult(file));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Select supported MediaRecorder mimeType
      const mimeTypeCandidates = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/mp4;codecs=avc1.42E01E",
        "video/mp4",
        "video/webm"
      ];

      let selectedMimeType = "";
      for (const candidate of mimeTypeCandidates) {
        if (MediaRecorder.isTypeSupported(candidate)) {
          selectedMimeType = candidate;
          break;
        }
      }

      if (!selectedMimeType) {
        cleanup();
        resolve(fallbackResult(file));
        return;
      }

      try {
        const stream = canvas.captureStream(fps);

        // Try to capture audio from original video
        try {
          const videoStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
          if (videoStream) {
            const audioTracks = videoStream.getAudioTracks();
            if (audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
            }
          }
        } catch (e) {
          console.warn("Audio track extraction not available:", e);
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: targetBitrate
        });

        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanup();
          const ext = selectedMimeType.includes("mp4") ? "mp4" : "webm";
          const blob = new Blob(chunks, { type: selectedMimeType.split(";")[0] });
          
          // If compressed result is somehow larger than original, stick to original file
          if (blob.size >= originalSize) {
            resolve(fallbackResult(file));
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${ext}`), {
            type: selectedMimeType.split(";")[0],
            lastModified: Date.now()
          });

          const compressedSize = compressedFile.size;
          const reductionPercentage = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

          resolve({
            compressedFile,
            previewUrl: URL.createObjectURL(blob),
            originalSize,
            compressedSize,
            reductionPercentage
          });
        };

        mediaRecorder.start(100);

        // Render frames loop
        let animId: number;
        const drawFrame = () => {
          if (video.paused || video.ended) return;
          ctx.drawImage(video, 0, 0, width, height);

          if (onProgress && duration > 0) {
            const progress = Math.min(99, Math.round((video.currentTime / duration) * 100));
            onProgress(progress);
          }

          animId = requestAnimationFrame(drawFrame);
        };

        video.onended = () => {
          cancelAnimationFrame(animId);
          ctx.drawImage(video, 0, 0, width, height);
          if (onProgress) onProgress(100);
          setTimeout(() => mediaRecorder.stop(), 200);
        };

        video.onerror = () => {
          cancelAnimationFrame(animId);
          cleanup();
          resolve(fallbackResult(file));
        };

        // Play at 1.5x speed for faster client-side encoding
        video.playbackRate = 1.5;
        await video.play();
        drawFrame();
      } catch (err) {
        console.error("Video compression failed, using original:", err);
        cleanup();
        resolve(fallbackResult(file));
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(fallbackResult(file));
    };
  });
}

function fallbackResult(file: File): VideoCompressionResult {
  return {
    compressedFile: file,
    previewUrl: URL.createObjectURL(file),
    originalSize: file.size,
    compressedSize: file.size,
    reductionPercentage: 0
  };
}
