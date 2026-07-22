import { Href } from "expo-router";

export type moreLink = {
  name: string;
  icon: any;
  route?: Href;
  variant?: "default" | "logout";
};
