"use client"

import type React from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomizationPanelProps {
  customization: any
  setCustomization: (customization: any) => void
}

export function CustomizationPanel({ customization, setCustomization }: CustomizationPanelProps) {
  const handleFontSizeChange = (value: number[]) => {
    setCustomization({ ...customization, fontSize: value[0] })
  }

  const handleDisplayWordsChange = (value: number[]) => {
    setCustomization({ ...customization, displayWords: value[0] })
  }

  const handlePositionYChange = (value: number[]) => {
    setCustomization({ ...customization, positionY: value[0] })
  }

  const handleFontFamilyChange = (value: string) => {
    setCustomization({ ...customization, fontFamily: value })
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomization({ ...customization, color: e.target.value })
  }

  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomization({ ...customization, strokeColor: e.target.value })
  }

  const setStrokeWeight = (weight: string) => {
    setCustomization({ ...customization, strokeWeight: weight })
  }

  const setShadow = (size: string) => {
    setCustomization({ ...customization, shadow: size })
  }

  const toggleUppercase = (value: boolean) => {
    setCustomization({ ...customization, uppercase: value })
  }

  const toggleAnimation = (value: boolean) => {
    setCustomization({ ...customization, animation: value })
  }

  const togglePunctuation = (value: boolean) => {
    setCustomization({ ...customization, punctuation: value })
  }

  const toggleEmojiAnimation = (value: boolean) => {
    setCustomization({ ...customization, emojiAnimation: value })
  }

  const setAutoEmoji = (value: string) => {
    setCustomization({ ...customization, autoEmoji: value })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Font Section */}
        <div className="mb-6 pt-4">
          <h3 className="text-base font-medium mb-4">Police</h3>

          {/* Font Family, Font Weight, Uppercase */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Font Family */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Choix police</Label>
              <Select value={customization.fontFamily} onValueChange={handleFontFamilyChange}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Impact">Impact</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Weight */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Font Weight</Label>
              <Select
                value={customization.fontWeight}
                onValueChange={(value) => setCustomization({ ...customization, fontWeight: value })}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                  <SelectItem value="Bold">Bold</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Uppercase */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Majuscule</Label>
              <ToggleGroup type="single" value={customization.uppercase ? "yes" : "no"} className="flex">
                <ToggleGroupItem
                  value="yes"
                  className="px-4 py-1.5 text-sm font-medium rounded-l-md border flex-1"
                  onClick={() => toggleUppercase(true)}
                >
                  Yes
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="no"
                  className="px-4 py-1.5 text-sm font-medium rounded-r-md border flex-1"
                  onClick={() => toggleUppercase(false)}
                >
                  No
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Font Size and Color */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Font Size */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Taille</Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex items-center w-24">
                  <Input
                    type="text"
                    value={customization.fontSize}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setCustomization({ ...customization, fontSize: value })
                      }
                    }}
                    className="pr-8 h-10"
                  />
                  <span className="absolute right-3 text-gray-500 text-sm">px</span>
                </div>
                <div className="flex-1">
                  <Slider
                    value={[customization.fontSize]}
                    min={12}
                    max={96}
                    step={1}
                    onValueChange={handleFontSizeChange}
                  />
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Couleur</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={customization.color}
                  onChange={handleColorChange}
                  className="w-full h-10 p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Stroke weight and color */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            {/* Stroke weight */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Taille contour</Label>
              <ToggleGroup type="single" value={customization.strokeWeight} className="flex">
                {["None", "Small", "Medium", "Large"].map((weight) => (
                  <ToggleGroupItem
                    key={weight}
                    value={weight}
                    className="px-2 py-1.5 text-sm font-medium flex-1"
                    onClick={() => setStrokeWeight(weight)}
                  >
                    {weight}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Stroke Color */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Couleur contour</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={customization.strokeColor}
                  onChange={handleStrokeColorChange}
                  className="w-full h-10 p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Shadow */}
          <div className="mb-4">
            <Label className="text-sm font-medium block mb-1.5">Ombre</Label>
            <ToggleGroup type="single" value={customization.shadow} className="flex">
              {["None", "Small", "Medium", "Large"].map((size) => (
                <ToggleGroupItem
                  key={size}
                  value={size}
                  className="px-4 py-1.5 text-sm font-medium flex-1"
                  onClick={() => setShadow(size)}
                >
                  {size}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Caption Section */}
        <div>
          <h3 className="text-base font-medium mb-4">Sous-titres</h3>

          {/* Display word */}
          <div className="mb-4">
            <Label className="text-sm font-medium block mb-1.5">Nombre de mots affichés</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center w-24">
                <Input
                  type="text"
                  value={customization.displayWords}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setCustomization({ ...customization, displayWords: value })
                    }
                  }}
                  className="pr-16 h-10"
                />
                <span className="absolute right-3 text-gray-500 text-sm">words</span>
              </div>
              <div className="flex-1">
                <Slider
                  value={[customization.displayWords]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={handleDisplayWordsChange}
                />
              </div>
            </div>
          </div>

          {/* Position Y */}
          <div className="mb-4">
            <Label className="text-sm font-medium block mb-1.5">Position Y</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center w-24">
                <Input
                  type="text"
                  value={customization.positionY}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setCustomization({ ...customization, positionY: value })
                    }
                  }}
                  className="pr-8 h-10"
                />
                <span className="absolute right-3 text-gray-500 text-sm">%</span>
              </div>
              <div className="flex-1">
                <Slider
                  value={[customization.positionY]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handlePositionYChange}
                />
              </div>
            </div>
          </div>

          {/* Animation and Punctuation */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            {/* Animation */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Animation</Label>
              <ToggleGroup type="single" value={customization.animation ? "yes" : "no"} className="flex">
                <ToggleGroupItem
                  value="yes"
                  className="px-4 py-1.5 text-sm font-medium rounded-l-md border flex-1"
                  onClick={() => toggleAnimation(true)}
                >
                  Yes
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="no"
                  className="px-4 py-1.5 text-sm font-medium rounded-r-md border flex-1"
                  onClick={() => toggleAnimation(false)}
                >
                  No
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Punctuation */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Ponctuation</Label>
              <ToggleGroup type="single" value={customization.punctuation ? "yes" : "no"} className="flex">
                <ToggleGroupItem
                  value="yes"
                  className="px-4 py-1.5 text-sm font-medium rounded-l-md border flex-1"
                  onClick={() => togglePunctuation(true)}
                >
                  Yes
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="no"
                  className="px-4 py-1.5 text-sm font-medium rounded-r-md border flex-1"
                  onClick={() => togglePunctuation(false)}
                >
                  No
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Auto emoji and Emoji animation */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            {/* Auto emoji */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Auto emoji</Label>
              <ToggleGroup type="single" value={customization.autoEmoji} className="flex">
                <ToggleGroupItem
                  value="Auto"
                  className="px-2 py-1.5 text-sm font-medium flex-1"
                  onClick={() => setAutoEmoji("Auto")}
                >
                  Auto
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Top"
                  className="px-2 py-1.5 text-sm font-medium flex-1"
                  onClick={() => setAutoEmoji("Top")}
                >
                  Top
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="None"
                  className="px-2 py-1.5 text-sm font-medium flex-1"
                  onClick={() => setAutoEmoji("None")}
                >
                  None
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Emoji animation */}
            <div>
              <Label className="text-sm font-medium block mb-1.5">Animation emoji</Label>
              <ToggleGroup type="single" value={customization.emojiAnimation ? "yes" : "no"} className="flex">
                <ToggleGroupItem
                  value="yes"
                  className="px-4 py-1.5 text-sm font-medium rounded-l-md border flex-1"
                  onClick={() => toggleEmojiAnimation(true)}
                >
                  Yes
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="no"
                  className="px-4 py-1.5 text-sm font-medium rounded-r-md border flex-1"
                  onClick={() => toggleEmojiAnimation(false)}
                >
                  No
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}