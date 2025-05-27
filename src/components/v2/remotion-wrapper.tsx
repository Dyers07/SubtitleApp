"use client";

import React, { useState, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { CaptionedVideo } from "@/remotion/CaptionedVideo";
import { VideoProject } from "@/types";

interface Props {
  project: VideoProject;
  playing: boolean;
  onTimeUpdate: (t: number) => void;
}

export function RemotionWrapper({
  project,
  playing,
  onTimeUpdate,
}: Props) {
  const [ref, setRef] = useState<PlayerRef | null>(null);

  // Play / pause when `playing` toggles
  useEffect(() => {
    if (!ref) return;
    if (playing) {
      ref.play?.();
    } else {
      ref.pause?.();
    }
  }, [playing, ref]);

  // Poll current frame → convert to seconds → report back
  useEffect(() => {
    if (!ref) return;
    const id = setInterval(() => {
      const frame = ref.getCurrentFrame?.();
      if (typeof frame === "number") {
        onTimeUpdate(frame / project.fps);
      }
    }, 100);
    return () => clearInterval(id);
  }, [ref, project.fps, onTimeUpdate]);

  return (
    <Player
      ref={setRef}
      component={CaptionedVideo}
      // we cast to any here because Player expects a plain record
      inputProps={project as any}
      durationInFrames={Math.floor(project.videoDuration * project.fps)}
      fps={project.fps}
      compositionWidth={project.width}
      compositionHeight={project.height}
      style={{ width: "100%", aspectRatio: `${project.width}/${project.height}` }}
      controls={false}
    />
  );
}
