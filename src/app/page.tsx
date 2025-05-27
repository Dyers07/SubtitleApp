// src/app/page.tsx
"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { SubtitleCustomizer } from "@/components/v2/subtitle-customizer";
import type { VideoProject, Subtitle } from "@/types";
import { defaultSubtitleStyle } from "@/types";
import { splitSubtitles } from "@/utils/splitSubtitles";

export default function Home() {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [rawSubtitles, setRawSubtitles] = useState<Subtitle[]>([]);

  const handleVideoProcessed = (
    videoUrl: string,
    videoDuration: number,
    subtitles: Subtitle[],
    width: number,
    height: number
  ) => {
    // On stocke les sous-titres “bruts” (avec words[]) pour pouvoir les resplitter à la volée
    setRawSubtitles(subtitles);

    // Split initial à 3 mots
    const initialSubs = splitSubtitles(subtitles, 3);
    setProject({
      id: Date.now().toString(),
      videoUrl,
      videoDuration,
      subtitles: initialSubs,
      style: defaultSubtitleStyle,
      width,
      height,
      fps: 30,
    });
  };

  return (
    <main className="h-screen w-full bg-gray-50">
      {!project ? (
        <div className="max-w-2xl mx-auto py-12">
          <VideoUpload onVideoProcessed={handleVideoProcessed} />
        </div>
      ) : (
        <SubtitleCustomizer
          project={project}
          rawSubtitles={rawSubtitles}
          onProjectUpdate={setProject}
          onReset={() => {
            /* Optionnel : tu peux ici reset le player si besoin */
          }}
        />
      )}
    </main>
  );
}
