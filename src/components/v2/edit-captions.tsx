// src/components/v2/edit-captions.tsx
"use client"
import React, { useState, useEffect } from "react"
import {
  RefreshCw,
  Edit2,
  Trash2,
  MoreHorizontal,
  Plus,
  Check,
  X,
} from "lucide-react"
import type { SubtitleSegment } from "@/types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

interface EditCaptionsProps {
  subtitles: SubtitleSegment[]
  selectedSubtitle: string | null
  setSelectedSubtitle: (id: string | null) => void
  updateSubtitle: (id: string, updates: Partial<SubtitleSegment>) => void
}

export function EditCaptions({
  subtitles,
  selectedSubtitle,
  setSelectedSubtitle,
  updateSubtitle,
}: EditCaptionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState<string>("")
  const [wordTimes, setWordTimes] = useState<
    Record<string, { start: number; end: number }[]>
  >({})

  useEffect(() => {
    if (editingId) {
      const seg = subtitles.find((s) => s.id === editingId)
      setEditText(seg ? seg.text : "")
    }
  }, [editingId, subtitles])

  useEffect(() => {
    const times: typeof wordTimes = {}
    subtitles.forEach((seg) => {
      const words = seg.text.split(/\s+/)
      const duration = seg.endTime - seg.startTime
      const per = duration / Math.max(1, words.length)
      times[seg.id] = words.map((_, i) => ({
        start: seg.startTime + per * i,
        end: seg.startTime + per * (i + 1),
      }))
    })
    setWordTimes(times)
  }, [subtitles])

  const handleDeleteSegment = (seg: SubtitleSegment) => {
    updateSubtitle(seg.id, { text: "", endTime: seg.startTime })
  }

  const handleSaveEdit = (seg: SubtitleSegment) => {
    const newWords = editText.trim().split(/\s+/).filter(Boolean)
    const duration = seg.endTime - seg.startTime
    const per = duration / Math.max(1, newWords.length)
    updateSubtitle(seg.id, {
      text: editText,
      startTime: seg.startTime,
      endTime: seg.startTime + per * newWords.length,
    })
    setEditingId(null)
  }

  const handleDeleteWord = (seg: SubtitleSegment, idx: number) => {
    const words = seg.text.split(/\s+/).filter(Boolean)
    const newWords = words.filter((_, i) => i !== idx)
    const duration = seg.endTime - seg.startTime
    const per = duration / Math.max(1, newWords.length)
    updateSubtitle(seg.id, {
      text: newWords.join(" "),
      endTime: seg.startTime + per * newWords.length,
    })
  }

  const handleHighlightColor = (
    seg: SubtitleSegment,
    idx: number,
    color: 'none' | 'green' | 'yellow' | 'red'
  ) => {
    const prev = Array.isArray(seg.style?.highlightWords) ? seg.style?.highlightWords : []
    const next = [...prev]
    next[idx] = color
    updateSubtitle(seg.id, {
      style: { ...seg.style, highlightWords: next },
    })
  }

  const handleTimeChange = (
    seg: SubtitleSegment,
    idx: number,
    start: number,
    end: number
  ) => {
    const times = wordTimes[seg.id].slice()
    times[idx] = { start, end }
    setWordTimes({ ...wordTimes, [seg.id]: times })
    const newStart = Math.min(...times.map((t) => t.start))
    const newEnd = Math.max(...times.map((t) => t.end))
    updateSubtitle(seg.id, { startTime: newStart, endTime: newEnd })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">Précision sous-titres IA</div>
        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
          99.73%
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {subtitles.map((subtitle) => {
          const isSelected = selectedSubtitle === subtitle.id
          const isEditing = editingId === subtitle.id
          const words = subtitle.text.split(/\s+/).filter(Boolean)
          return (
            <div
              key={subtitle.id}
              className={`px-4 py-3 border-b border-gray-100 flex flex-col ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedSubtitle(subtitle.id)
              }}
            >
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {subtitle.startTime.toFixed(2)} - {subtitle.endTime.toFixed(2)}
                </div>
                <div className="flex space-x-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(subtitle)}
                        className="p-1 text-green-500 hover:bg-green-100 rounded"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingId(subtitle.id)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSegment(subtitle)}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  className="mt-2 w-full p-2 border border-gray-300 rounded"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                />
              ) : (
                <div className="mt-2 flex flex-wrap gap-1">
                  {words.map((word, idx) => {
                    const times = wordTimes[subtitle.id]?.[idx] || {
                      start: subtitle.startTime,
                      end: subtitle.endTime,
                    }

                    const highlight = Array.isArray(subtitle.style?.highlightWords)
                      ? subtitle.style?.highlightWords[idx] ?? 'none'
                      : 'none'

                    return (
                      <DropdownMenu key={idx}>
                        <DropdownMenuTrigger asChild>
                          <span
                            className={`px-1 rounded cursor-pointer hover:bg-gray-100 ${
                              highlight !== 'none' ? `bg-${highlight}-200` : ""
                            }`}
                          >
                            {word}
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuRadioGroup
                            value={highlight}
                            onValueChange={(value) => {
                              if (
                                value === "none" ||
                                value === "green" ||
                                value === "yellow" ||
                                value === "red"
                              ) {
                                handleHighlightColor(subtitle, idx, value)
                              }
                            }}
                          >
                            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="green">Green</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="yellow">Yellow</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="red">Red</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          <div className="px-2 py-1 flex space-x-2">
                            <input
                              type="number"
                              className="w-16 p-1 border rounded"
                              value={times.start.toFixed(2)}
                              onChange={(e) =>
                                handleTimeChange(
                                  subtitle,
                                  idx,
                                  parseFloat(e.target.value),
                                  times.end
                                )
                              }
                            />
                            <input
                              type="number"
                              className="w-16 p-1 border rounded"
                              value={times.end.toFixed(2)}
                              onChange={(e) =>
                                handleTimeChange(
                                  subtitle,
                                  idx,
                                  times.start,
                                  parseFloat(e.target.value)
                                )
                              }
                            />
                          </div>
                          <DropdownMenuItem onSelect={() => {}}>Add line break</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Move to next line</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Split into new line</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Add sound</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {}}>Add word</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteWord(subtitle, idx)}>
                            Remove word
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        <div className="flex justify-center py-4">
          <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
