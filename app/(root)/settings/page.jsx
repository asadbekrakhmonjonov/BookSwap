"use client"

import React from "react"
import withAuth from "@/hoc/withAuth"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import FormField from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import { app } from "@/firebase/config"
import useSWR, { mutate } from "swr"

const settingsSchema = z.object({
  name: z.string().optional().refine(val => !val || val.length >= 3, {
    message: "Name must be at least 3 characters",
  }),
  email: z.string().optional().refine(val => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email address",
  }),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters",
  }),
})

const fetcher = async (url) => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  const token = await user.getIdToken()
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error("Failed to fetch user data")
  return res.json()
}

function SettingsPage() {
  const { data: userData, error } = useSWR("/api/protected", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  })

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const { reset } = form
  const router = useRouter()

  React.useEffect(() => {
    if (userData) {
      reset({
        name: userData.displayName || "",
        email: userData.email || "",
        password: "",
      })
    }
  }, [userData, reset])

  const onSubmit = async (values) => {
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "")
    )

    if (Object.keys(filteredValues).length === 0) {
      toast.error("Please enter a field to update.")
      return
    }

    const bodyToSend = {}
    if (filteredValues.name) bodyToSend.displayName = filteredValues.name
    if (filteredValues.email) bodyToSend.email = filteredValues.email
    if (filteredValues.password) bodyToSend.password = filteredValues.password

    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (!user) throw new Error("Not authenticated")

      const token = await user.getIdToken()

      const res = await fetch("/api/protected", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Clear SWR cache and trigger immediate revalidation
      mutate("/api/protected")
      await user.reload()

      toast.success("Account updated successfully.")
      router.push('/')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Update failed.")
      } else {
        toast.error("Update failed.")
      }
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete your account?")
    if (!confirmed) return

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error("Not authenticated")

      const token = await user.getIdToken()

      const res = await fetch("/api/protected", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Clear SWR cache before signing out
      mutate("/api/protected", null, false)
      await signOut(auth)
      toast.success("Account deleted.")
      router.push("/sign-in")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Account deletion failed.")
      } else {
        toast.error("Account deletion failed.")
      }
    }
  }

  return (
    <div className="form-wrapper lg:min-2-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <h3 className="text-primary-100 text-center">Update your account settings</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            <FormField
              control={form.control}
              name="name"
              label="Display Name"
              placeholder="Update your name"
            />
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Update your email"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="New password"
              type="password"
            />
            <Button className="btn w-full" type="submit">
              Update Account
            </Button>
          </form>
        </Form>
        <hr className="my-4" />
        <Button variant="destructive" className="btn w-full" onClick={handleDelete}>
          Delete Account
        </Button>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage)