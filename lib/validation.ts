import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide");

const time = z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide");

const phone = z
  .string()
  .trim()
  .min(6, "Numéro de téléphone invalide")
  .max(20, "Numéro de téléphone invalide")
  .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide");

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} requis`)
    .max(60, `${label} trop long`);

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Prestation requise"),
  date: isoDate,
  time,
  firstName: name("Prénom"),
  lastName: name("Nom"),
  email: z.string().trim().email("Adresse email invalide").max(120),
  phone,
  notes: z.string().trim().max(500, "500 caractères maximum").optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const formationRequestSchema = z.object({
  formationId: z.string().min(1, "Formation requise"),
  kitOption: z.string().max(40).optional(),
  firstName: name("Prénom"),
  lastName: name("Nom"),
  email: z.string().trim().email("Adresse email invalide").max(120),
  phone,
  message: z.string().trim().max(800, "800 caractères maximum").optional(),
});

export type FormationRequestInput = z.infer<typeof formationRequestSchema>;
