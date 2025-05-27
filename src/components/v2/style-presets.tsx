"use client"

import { Zap } from "lucide-react"

interface StylePresetProps {
  onSelectPreset: (preset: any) => void
}

export function StylePresets({ onSelectPreset }: StylePresetProps) {
  const presets = [
    {
      id: "sara",
      name: "Sara",
      isNew: true,
      isPremium: true,
      fontFamily: "Montserrat",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "None",
      shadow: "Medium",
      uppercase: false,
    },
    {
      id: "daniel",
      name: "Daniel",
      isNew: true,
      isPremium: true,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Small",
      shadow: "Large",
      uppercase: false,
    },
    {
      id: "dan2",
      name: "DAN 2",
      isNew: true,
      isPremium: false,
      fontFamily: "Impact",
      fontWeight: "Heavy",
      color: "#FFFF00",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "None",
      uppercase: true,
    },
    {
      id: "hormozi4",
      name: "HORMOZI 4",
      isNew: true,
      isPremium: true,
      fontFamily: "Helvetica",
      fontWeight: "Heavy",
      color: "#FFFF00",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "dan",
      name: "DAN",
      isNew: false,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Medium",
      uppercase: true,
    },
    {
      id: "devin",
      name: "DEVIN",
      isNew: false,
      isPremium: false,
      fontFamily: "Helvetica",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "tayo",
      name: "Tayo",
      isNew: false,
      isPremium: false,
      fontFamily: "Montserrat",
      fontWeight: "Medium",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "None",
      shadow: "Medium",
      uppercase: false,
    },
    {
      id: "ella",
      name: "ELLA",
      isNew: false,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Small",
      shadow: "Medium",
      uppercase: true,
    },
    {
      id: "tracy",
      name: "TRACY",
      isNew: false,
      isPremium: false,
      fontFamily: "Helvetica",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "luke",
      name: "LUKE",
      isNew: false,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Small",
      shadow: "Medium",
      uppercase: true,
    },
    {
      id: "hormozi1",
      name: "HORMOZI 1",
      isNew: false,
      isPremium: false,
      fontFamily: "Helvetica",
      fontWeight: "Heavy",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "hormozi2",
      name: "HORMOZI 2",
      isNew: false,
      isPremium: false,
      fontFamily: "Helvetica",
      fontWeight: "Heavy",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "hormozi3",
      name: "HORMOZI 3",
      isNew: false,
      isPremium: false,
      fontFamily: "Helvetica",
      fontWeight: "Heavy",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "hormozi5",
      name: "Hormozi 5",
      isNew: false,
      isPremium: true,
      fontFamily: "Helvetica",
      fontWeight: "Medium",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Small",
      shadow: "Medium",
      uppercase: false,
    },
    {
      id: "leila",
      name: "LEILA",
      isNew: false,
      isPremium: true,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "jason",
      name: "JASON",
      isNew: false,
      isPremium: true,
      fontFamily: "Impact",
      fontWeight: "Bold",
      color: "#FF5733",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
    {
      id: "william",
      name: "WILLIAM",
      isNew: false,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFF00",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Medium",
      uppercase: true,
    },
    {
      id: "leon",
      name: "LEON",
      isNew: false,
      isPremium: true,
      fontFamily: "Impact",
      fontWeight: "Bold",
      color: "#FF5733",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
    },
  ]

  const handleSelectPreset = (preset: any) => {
    // Convertir le preset en format de customization
    const customization = {
      styleName: preset.name,
      fontSize: 30, // Valeur par défaut
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight,
      uppercase: preset.uppercase,
      color: preset.color,
      backgroundColor: preset.backgroundColor,
      strokeWeight: preset.strokeWeight,
      strokeColor: "#000000", // Valeur par défaut
      shadow: preset.shadow,
      displayWords: 3, // Valeur par défaut
      positionY: 36, // Valeur par défaut
      animation: true, // Valeur par défaut
      punctuation: false, // Valeur par défaut
      autoEmoji: "Auto", // Valeur par défaut
      emojiAnimation: true, // Valeur par défaut
    }

    onSelectPreset(customization)
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="bg-gray-600 rounded-md h-16 flex items-center justify-center relative cursor-pointer hover:bg-gray-500 transition-colors"
            onClick={() => handleSelectPreset(preset)}
          >
            {preset.isNew && (
              <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-tl-md rounded-br-md">
                New
              </div>
            )}

            <div
              className={`text-center ${
                preset.id === "dan2" || preset.id === "hormozi4" || preset.id === "william"
                  ? "text-yellow-300"
                  : preset.id === "jason" || preset.id === "leon"
                    ? "text-orange-500"
                    : "text-white"
              } ${preset.uppercase ? "uppercase" : ""}`}
              style={{
                fontFamily: preset.fontFamily,
                fontWeight: preset.fontWeight === "Heavy" ? "900" : preset.fontWeight === "Bold" ? "700" : "500",
                textShadow:
                  preset.shadow === "Large"
                    ? "2px 2px 4px rgba(0,0,0,0.8)"
                    : preset.shadow === "Medium"
                      ? "1px 1px 3px rgba(0,0,0,0.7)"
                      : preset.shadow === "Small"
                        ? "1px 1px 2px rgba(0,0,0,0.5)"
                        : "none",
                WebkitTextStroke:
                  preset.strokeWeight === "Large"
                    ? "2px black"
                    : preset.strokeWeight === "Medium"
                      ? "1.5px black"
                      : preset.strokeWeight === "Small"
                        ? "1px black"
                        : "0",
              }}
            >
              {preset.name}
            </div>

            {preset.isPremium && (
              <div className="absolute top-1 right-1 text-orange-400">
                <Zap size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
