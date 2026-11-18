import { z } from "zod";

export const esquemaCuentaServicioFirebase = z
  .object({
    type: z.literal("service_account").optional(),
    project_id: z.string().min(1),
    client_email: z.string().email(),
    private_key: z.string().min(1),
  })
  .passthrough();
