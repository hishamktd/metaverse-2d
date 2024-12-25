import z from "zod";
import { UserType } from "../constants";

const { ADMIN, USER } = UserType;

export const SignUpSchema = z.object({
  username: z.string().nonempty("Username cannot be empty"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  type: z.enum([ADMIN, USER]).refine((value) => [ADMIN, USER].includes(value), {
    message: "User type must be either admin or user",
  }),
});

export const SignInSchema = z.object({
  username: z.string().nonempty("Username cannot be empty"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const UpdateMetaDataSchema = z.object({
  avatarId: z.string().nonempty("Avatar ID cannot be empty"),
});

export const CreateSpaceSchema = z.object({
  name: z.string().nonempty({ message: "Name cannot be empty" }),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/, {
    message:
      "Dimensions must be in the format 'width X height', e.g., '100x200'",
  }),
  mapId: z.string().nonempty({ message: "Map ID is required" }),
});

export const AddElementSchema = z.object({
  spaceId: z.string().nonempty({ message: "Space ID is required" }),
  elementId: z.string().nonempty({ message: "Element ID is required" }),
  x: z
    .number()
    .min(0, { message: "X-coordinate must be a non-negative number" }),
  y: z
    .number()
    .min(0, { message: "Y-coordinate must be a non-negative number" }),
});

export const DeleteElementSchema = z.object({
  id: z.string().nonempty({ message: "Element ID is required" }),
});

export const CreateElementSchema = z.object({
  imageUrl: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .nonempty({ message: "Image URL is required" }),
  width: z.number().positive({ message: "Width must be a positive number" }),
  height: z.number().positive({ message: "Height must be a positive number" }),
  static: z.boolean().refine((value) => typeof value === "boolean", {
    message: "Static must be a boolean value (true or false)",
  }),
});

export const UpdateElementSchema = z.object({
  imageUrl: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .nonempty({ message: "Image URL is required" }),
});

export const CreateAvatarSchema = z.object({
  imageUrl: z
    .string()
    .url({ message: "Image URL must be a valid URL" })
    .nonempty({ message: "Image URL is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
});

export const CreateMapSchema = z.object({
  thumbnail: z
    .string()
    .url({ message: "Thumbnail must be a valid URL" })
    .nonempty({ message: "Thumbnail is required" }),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/, {
    message:
      "Dimensions must be in the format 'width X height', e.g., '100x200'",
  }),
  name: z.string().nonempty({ message: "Name is required" }),   
  defaultElements: z
    .array(
      z.object({
        elementId: z.string().nonempty({ message: "Element ID is required" }),
        x: z
          .number()
          .min(0, { message: "X-coordinate must be a non-negative number" }),
        y: z
          .number()
          .min(0, { message: "Y-coordinate must be a non-negative number" }),
      })
    )
    .nonempty({
      message: "Default elements must include at least one element",
    }),
});
