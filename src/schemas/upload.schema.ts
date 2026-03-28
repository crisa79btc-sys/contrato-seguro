import { z } from 'zod';
import { MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@/config/constants';

export const uploadFileSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo é obrigatório'),
  size: z
    .number()
    .max(MAX_UPLOAD_SIZE_BYTES, `Arquivo excede o limite de ${MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB`),
  type: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Formato não suportado. Envie um arquivo PDF.' }),
  }),
});
