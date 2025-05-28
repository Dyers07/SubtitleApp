// src/app/page.tsx
"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { SubtitleCustomizer } from "@/components/v2/subtitle-customizer";
import { ExportDialog } from "@/components/export-dialog";
import type { VideoProject, Subtitle } from "@/types";
import { defaultSubtitleStyle } from "@/types";
import { splitSubtitles } from "@/utils/splitSubtitles";

export default function Home() {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [rawSubtitles, setRawSubtitles] = useState<Subtitle[]>([]);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoProcessed = (
    videoUrl: string,
    videoDuration: number,
    subtitles: Subtitle[],
    width: number,
    height: number
  ) => {
    setRawSubtitles(subtitles);
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

  const handleStartExport = () => {
    setExporting(true);
    setProgress(0);
  };

  return (
    <main className="h-screen w-full bg-gray-50">
      <ExportDialog
        open={exporting}
        progress={progress}
        onCancel={() => setExporting(false)}
      />

      {!project ? (
        <div className="max-w-2xl mx-auto py-12">
          <VideoUpload onVideoProcessed={handleVideoProcessed} />
        </div>
      ) : (
        <SubtitleCustomizer
          project={project}
          rawSubtitles={rawSubtitles}
          onProjectUpdate={setProject}
          onReset={() => {}}
          onStartExport={handleStartExport}
          onExportProgress={(p) => setProgress(p)}
        />
      )}
    </main>
  );
}
