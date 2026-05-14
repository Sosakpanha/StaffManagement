import { z } from 'zod'

export const staffFormSchema = z.object({
	staffId: z
		.string()
		.trim()
		.min(1, 'Staff ID is required.')
		.max(8, 'Staff ID must be 1-8 characters.'),
	fullName: z
		.string()
		.trim()
		.min(1, 'Full name is required.')
		.max(100, 'Full name must be 1-100 characters.'),
	birthday: z
		.date({ message: 'Birthday is required.' }),
	gender: z
		.union([z.literal(1), z.literal(2)], { message: 'Gender is required.' }),
})

export type StaffFormValues = z.infer<typeof staffFormSchema>
