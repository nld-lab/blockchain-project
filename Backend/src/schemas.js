import { z } from "zod";

export const identitySchema = z.object({
  idNumber: z.string().trim().min(1, "Le numéro de carte est requis."),
  fullName: z.string().trim().min(1, "Le nom est requis."),
});

export const voteSchema = identitySchema.extend({
  choiceId: z.number().int().nonnegative("Le choix est invalide."),
});

export const createElectionSchema = z.object({
  title: z.string().trim().min(1, "L'intitulé est requis.").max(200),
  choices: z
    .array(z.string().trim().min(1, "Un choix est vide.").max(120))
    .min(2, "Au moins deux choix sont requis.")
    .max(20, "Vingt choix maximum."),
});
