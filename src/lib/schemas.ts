import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
});
