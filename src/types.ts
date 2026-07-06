/**
 * Shared Type Definitions for the Future Samurai 3D Experience.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SectionContent {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  number: string;
}

export interface MouseCoords {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface PreloaderState {
  progress: number;
  isComplete: boolean;
}
