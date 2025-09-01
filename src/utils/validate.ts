import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  phone: z.string().min(6),
  user_type: z.enum(['tenant','owner'])
});

export const propertySchema = z.object({
  title: z.string().min(3),
  price: z.number().int().positive(),
  type: z.enum(['appartement','studio','maison']),
  surface: z.number().int().optional(),
  rooms: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  whatsapp: z.string().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional()
});

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const res = schema.safeParse(body);
  if (!res.success) {
    const msg = res.error.issues.map(i => `${i.path.join('.')||'field'}: ${i.message}`).join(', ');
    throw { status: 400, message: msg };
  }
  return res.data;
}
