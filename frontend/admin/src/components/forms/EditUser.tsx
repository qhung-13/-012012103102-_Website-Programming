"use client";

import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "react-toastify";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters!" })
    .max(50),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EditUserProps = {
  userId: string | number;
  defaultValues: {
    fullName: string;
    phone: string;
    address: string;
  };
  onUpdated?: () => void;
};

const EditUser = ({ userId, defaultValues, onUpdated }: EditUserProps) => {
  const { token } = useAuthStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await apiFetch(`/users/${userId}`, {
        method: "PUT",
        token,
        body: {
          name: values.fullName,
          phone: values.phone || null,
          address: values.address || null,
        },
      });
      toast.success("User updated.");
      onUpdated?.();
      closeRef.current?.click();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update user.",
      );
    }
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="mb-4">Edit User</SheetTitle>
        <SheetDescription asChild>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Optional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Optional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Submit"}
              </Button>
            </form>
          </Form>
        </SheetDescription>
      </SheetHeader>
      <SheetClose ref={closeRef} className="hidden" />
    </SheetContent>
  );
};

export default EditUser;
