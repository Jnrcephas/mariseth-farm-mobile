import {
  cropTagColors,
  weatherBackgrounds,
} from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { format, parseISO } from "date-fns";

export function getInitials(name: string): string {
  if (typeof name !== "string" || !name.trim()) return "";

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return initials;
}

export function updateSegmentedOption(key: string, option: string) {
  useUniversalStore.setState((state) => ({
    selectedSegmentedOption: {
      ...state.selectedSegmentedOption,
      key: option,
    },
  }));
}

export function handleToastShow(
  toast: any,
  message: string,
  async: boolean = false
) {
  toast.show(`${message}`, {
    type: "custom_type",
    placement: "bottom",
    duration: async ? 10000 : 3500,
    animationType: "slide-in",
  });
}

export function dataEncoder<T>(data: T) {
  return encodeURIComponent(JSON.stringify(data));
}

export function dataDecoder(data: string) {
  return JSON.parse(decodeURIComponent(data));
}

export function getWeatherAssets(description: string) {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("thunder"))
    return {
      icon: icons.thunderStorm,
      gradient: weatherBackgrounds.thunderStorm,
    };

  if (lowerDesc.includes("heavy rain"))
    return {
      icon: icons.heavyRain,
      gradient: weatherBackgrounds.heavyRain,
    };

  if (
    lowerDesc.includes("rain") ||
    lowerDesc.includes("drizzle") ||
    lowerDesc.includes("sleet")
  )
    return {
      icon: icons.rainy,
      gradient: weatherBackgrounds.rainy,
    };

  if (
    lowerDesc.includes("snow") ||
    lowerDesc.includes("blizzard") ||
    lowerDesc.includes("ice")
  )
    return {
      icon: icons.cloudy,
      gradient: weatherBackgrounds.cloudy,
    };

  if (
    lowerDesc.includes("cloud") ||
    lowerDesc.includes("overcast") ||
    lowerDesc.includes("fog") ||
    lowerDesc.includes("mist")
  )
    return {
      icon: icons.cloudy,
      gradient: weatherBackgrounds.cloudy,
    };

  if (lowerDesc.includes("sun"))
    return {
      icon: icons.sunny,
      gradient: weatherBackgrounds.sunny,
    };

  if (lowerDesc.includes("clear"))
    return {
      icon: icons.sunny,
      gradient: weatherBackgrounds.rainy,
    };

  if (lowerDesc.includes("wind") || lowerDesc.includes("blowing"))
    return {
      icon: icons.windy,
      gradient: weatherBackgrounds.windy,
    };

  return {
    icon: icons.cloudy,
    gradient: weatherBackgrounds.cloudy,
  };
}

export function getColorForItem(item: string) {
  const index = item.length % cropTagColors.length;
  return cropTagColors[index];
}

export function dueDateFormat(date: string) {
  if (!date) return "";
  return format(parseISO(date), "do MMMM, yyyy");
}
