import z,{ZodSchema} from "zod"


function validateWithSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const parsedData = schema.safeParse(data);

  if (!parsedData.success) {
    throw parsedData.error; 
  }

  return parsedData.data;
}


export default validateWithSchema;