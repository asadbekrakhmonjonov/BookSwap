"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { signUp, signIn } from "../firebase/auth"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import FormField from "@/components/FormField"

const baseSchema = {
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(3, "Password must be at least 3 characters"),
}

const authFormSchema = (formType) =>
  formType === "sign-in"
    ? z.object({
        email: baseSchema.email,
        password: baseSchema.password,
      })
    : z.object({
        name: baseSchema.name,
        email: baseSchema.email,
        password: baseSchema.password,
      })

export default function AuthForm({ formType }) {
  const formSchema = authFormSchema(formType)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const router = useRouter()
  const isSignIn = formType === "sign-in"
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(values) {
  setIsLoading(true)
  try {
    if (formType === "sign-up") {
      await signUp(values.email, values.password, values.name)
      toast.success("Account created successfully!")
      router.push("/sign-in")
    } else {
      const userCredential = await signIn(values.email, values.password)
      const idToken = await userCredential.user.getIdToken()
      await fetch("/api/userLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      })
      toast.success("Logged in successfully!")
      router.push("/")
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Something went wrong.")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="form-wrapper lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" width={100} height={40} />
        </div>
        <h3 className="text-primary-100">Share books with readers like yourself</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
              >
                Name:
              </FormField>
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            >
              Email:
            </FormField>
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Your password"
              type="password"
            >
              Password:
            </FormField>
            <Button className="btn" type="submit" disabled={isLoading}>
              {isSignIn ? "Sign in" : "Create an account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account?"}
          <Link className="font-bold text-user-primary ml-1" href={isSignIn ? "/sign-up" : "/sign-in"}>
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  )
}
