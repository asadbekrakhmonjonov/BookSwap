"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

const GENRE_OPTIONS = [
  "Fiction",
  "Non-Fiction",
  "Fantasy",
  "Science Fiction",
  "Biography",
  "Mystery",
  "Romance",
  "Horror",
  "Other",
];

const CONDITION_OPTIONS = ["New", "Like New", "Used", "Very Used", "Damaged"];

const CONTACT_APP_OPTIONS = [
  "WhatsApp",
  "Gmail",
  "Telegram",
  "Instagram",
  "KakaoTalk",
];

export default function BookForm({
  defaultValues = {},
  onSubmit,
  submitText = "Add Book",
}) {
  const methods = useForm({
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      condition: "",
      description: "",
      contactApp: "",
      contactId: "",
      public: false,
      ...defaultValues,
    },
  });

  const { handleSubmit, reset, register } = methods;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  async function internalSubmit(data) {
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser.getIdToken(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "public") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, value);
        }
      });

      files.forEach((file) => {
        formData.append("images", file);
      });

      if (onSubmit) {
        await onSubmit(formData, token);
        toast.success(`${submitText} successful!`);
        reset();
        setFiles([]);
        router.push("/");
      } else {
        throw new Error("No submit handler provided");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-border lg:min-w-[566px] max-w-lg mx-auto">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <h3 className="text-primary-100 text-center text-2xl font-semibold">
          {submitText}
        </h3>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(internalSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            <FormField
              name="title"
              label="Title"
              placeholder="Book title"
              control={methods.control}
            />
            <FormField
              name="author"
              label="Author"
              placeholder="Author name"
              control={methods.control}
            />

            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-primary-100 mb-1"
              >
                Genre
              </label>
              <select
                id="genre"
                {...register("genre")}
                className="block w-full border border-gray-700 bg-gray-900 text-primary-100 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select a genre</option>
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-primary-100 mb-1"
              >
                Condition
              </label>
              <select
                id="condition"
                {...register("condition")}
                className="block w-full border border-gray-700 bg-gray-900 text-primary-100 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              name="description"
              label="Description"
              placeholder="Description"
              control={methods.control}
            />

            <div>
              <label
                htmlFor="contactApp"
                className="block text-sm font-medium text-primary-100 mb-1"
              >
                Contact App
              </label>
              <select
                id="contactApp"
                {...register("contactApp")}
                className="block w-full border border-gray-700 bg-gray-900 text-primary-100 rounded-lg text-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select an app</option>
                {CONTACT_APP_OPTIONS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              name="contactId"
              label="Contact ID"
              placeholder="Your username or phone number"
              control={methods.control}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                {...register("public")}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="public"
                className="block text-sm font-medium text-primary-100"
              >
                Make this book public (read-only for others)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">
                Book Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-100 border border-gray-700 rounded-lg cursor-pointer bg-gray-900"
              />
              {files.length > 0 && (
                <p className="mt-2 text-sm text-gray-400">
                  {files.length} image(s) selected
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <Button type="submit" className="btn" disabled={loading}>
              {loading ? `${submitText}...` : submitText}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
