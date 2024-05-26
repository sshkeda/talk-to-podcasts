import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
