export type Space = {
  id: string;
  name: string;
  dimensions: string;
  elements: SpaceElement[];
};

export type SpaceElement = {
  id: string;
  elementId: string;
  x: number;
  y: number;
  imageUrl: string;
};
