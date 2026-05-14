import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiException } from '../api/client'
import { createStaff, getStaff, updateStaff } from '../api/staff'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DatePicker } from '../components/ui/DatePicker'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Radio, RadioGroup } from '../components/ui/Radio'
import { staffFormSchema, type StaffFormValues } from '../schemas/staff'
import { parseIsoDate, toIsoDate } from '../utils/dates'

export function StaffFormPage() {
	const { id } = useParams<{ id?: string }>()
	const navigate = useNavigate()
	const isEdit = Boolean(id)

	const [loading, setLoading] = useState(isEdit)
	const [submitting, setSubmitting] = useState(false)
	const [serverError, setServerError] = useState<string | null>(null)
	const [loadError, setLoadError] = useState<string | null>(null)

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<StaffFormValues>({
		resolver: zodResolver(staffFormSchema),
		defaultValues: { staffId: '', fullName: '', gender: 1 },
	})

	useEffect(() => {
		if (!id) return
		let cancelled = false
		// Standard cancellable fetch-on-mount pattern: the loading flag has
		// to flip on at effect start, then back off in finally().
		/* eslint-disable react-hooks/set-state-in-effect */
		setLoading(true)
		setLoadError(null)
		/* eslint-enable react-hooks/set-state-in-effect */
		getStaff(id)
			.then((staff) => {
				if (cancelled) return
				reset({
					staffId: staff.staffId,
					fullName: staff.fullName,
					birthday: parseIsoDate(staff.birthday),
					gender: staff.gender,
				})
			})
			.catch((err: unknown) => {
				if (cancelled) return
				const msg =
					err instanceof ApiException
						? err.message
						: 'Failed to load staff.'
				setLoadError(msg)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [id, reset])

	async function onSubmit(values: StaffFormValues) {
		setSubmitting(true)
		setServerError(null)
		try {
			const payload = {
				staffId: values.staffId,
				fullName: values.fullName,
				birthday: toIsoDate(values.birthday)!,
				gender: values.gender,
			}
			if (id) {
				await updateStaff(id, payload)
			} else {
				await createStaff(payload)
			}
			navigate('/staff')
		} catch (err) {
			const msg =
				err instanceof ApiException ? err.message : 'Save failed.'
			setServerError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	if (loadError) {
		return (
			<Card title={isEdit ? 'Edit Staff' : 'New Staff'}>
				<Alert tone="error" title="Couldn't load this staff member">
					{loadError}
				</Alert>
				<div className="mt-4">
					<Button onClick={() => navigate('/staff')}>Back to list</Button>
				</div>
			</Card>
		)
	}

	return (
		<Card
			title={isEdit ? 'Edit Staff' : 'New Staff'}
			description={isEdit ? 'Update this staff member.' : 'Add a new staff member.'}
		>
			{loading ? (
				<div className="py-12 text-center text-sm text-slate-500">Loading…</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
					{serverError && (
						<Alert tone="error" title="Save failed">
							{serverError}
						</Alert>
					)}

					<Field
						label="Staff ID"
						htmlFor="staffId"
						required
						hint="Up to 8 characters, must be unique."
						error={errors.staffId?.message}
					>
						<Input
							id="staffId"
							maxLength={8}
							placeholder="e.g. E000123"
							invalid={Boolean(errors.staffId)}
							{...register('staffId')}
						/>
					</Field>

					<Field
						label="Full name"
						htmlFor="fullName"
						required
						error={errors.fullName?.message}
					>
						<Input
							id="fullName"
							maxLength={100}
							placeholder="e.g. Jane Doe"
							invalid={Boolean(errors.fullName)}
							{...register('fullName')}
						/>
					</Field>

					<Field
						label="Birthday"
						required
						error={errors.birthday?.message}
					>
						<Controller
							control={control}
							name="birthday"
							render={({ field }) => (
								<DatePicker
									value={field.value}
									onChange={field.onChange}
									invalid={Boolean(errors.birthday)}
								/>
							)}
						/>
					</Field>

					<Field
						label="Gender"
						required
						error={errors.gender?.message}
					>
						<Controller
							control={control}
							name="gender"
							render={({ field }) => (
								<RadioGroup<number>
									value={field.value}
									onChange={(v) => field.onChange(v as 1 | 2)}
								>
									<Radio value={1}>Male</Radio>
									<Radio value={2}>Female</Radio>
								</RadioGroup>
							)}
						/>
					</Field>

					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="secondary"
							onClick={() => navigate('/staff')}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button type="submit" variant="primary" loading={submitting}>
							{isEdit ? 'Save changes' : 'Create staff'}
						</Button>
					</div>
				</form>
			)}
		</Card>
	)
}
