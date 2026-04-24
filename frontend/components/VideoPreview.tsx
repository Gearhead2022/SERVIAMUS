"use client";

import { useState } from "react";
import { Upload, Play, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface VideoPreviewProps {
  onVideoChange?: (videoUrl: string) => void;
}

export default function VideoPreview({ onVideoChange }: VideoPreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a local URL for the video
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      onVideoChange?.(url);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearVideo = () => {
    setVideoUrl("");
    onVideoChange?.("");
  };

  return (
    <div className="w-1/2 bg-gradient-to-br from-[#0f2244] to-[#1a3560] flex flex-col items-center justify-center p-8">
      {videoUrl ? (
        <>
          {/* Video Player */}
          <div className="w-full h-full flex flex-col gap-4">
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full flex-1 rounded-xl object-cover bg-black"
            />
            <Button
              variant="danger"
              onClick={handleClearVideo}
              icon={<X size={18} />}
              className="w-full"
            >
              Remove Video
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6 w-full">
          <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto">
            <Play size={64} className="text-white/50" />
          </div>
          <div>
            <h3 className="font-['DM_Serif_Display'] text-2xl text-white mb-2">
              Video Advertisement
            </h3>
            <p className="text-white/70">Upload a video to display</p>
            <p className="text-white/50 text-sm mt-4">
              Supports MP4, WebM, and other video formats
            </p>
          </div>

          {/* Upload Button */}
          <label className="inline-block">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isUploading}
              className="hidden"
            />
            <button
                type="button"
                onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                disabled={isUploading}
                >
                <Upload size={18} />
                {isUploading ? "Uploading..." : "Upload Video"}
                </button>
          </label>

          {/* Placeholder */}
          <div className="mt-8 w-full aspect-video rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
            <p className="text-white/40 text-sm">Video will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}