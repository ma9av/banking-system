"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import CustomField from "./CustomField";
import PlaidLink from "./PlaidLink";

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const schema = formSchema(type);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
        
        if (type === "sign-up") {

          const userData = {
            firstName: data.firstName!,
            lastName: data.lastName!,
            address: data.address!,
            city: data.city!,
            state: data.state!,
            postalCode: data.postalCode!,
            dateOfBirth: data.dateOfBirth!,
            aadharNo: data.aadharNo!,
            email: data.email,
            password: data.password,
          };

        const newUser = await signUp(userData);
        setUser(newUser);

      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data.email,
          password: data.password,
        })

        if (response) router.push("/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    console.log(data);
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className=" cursor-pointer items-center gap-1 flex">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Athens logo"
          />

          <h1 className="text-26 font font-ibm-plex-serif font-bold text-black-1">
            Athens
          </h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
            <p className="text-16 font-normal text-gray-600">
              {user
                ? "Link your account to get started"
                : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomField
                      label="First Name"
                      control={form.control}
                      type="firstName"
                      placeholder="ex: John"
                    />
                    <CustomField
                      label="Last Name"
                      control={form.control}
                      type="lastName"
                      placeholder="ex: Doe"
                    />
                  </div>
                  <CustomField
                    label="Address"
                    control={form.control}
                    type="address"
                    placeholder="Enter your address"
                  />
                  <CustomField
                    label="City"
                    control={form.control}
                    type="city"
                    placeholder="Enter your City"
                  />
                  <div className="flex gap-4">
                    <CustomField
                      label="State"
                      control={form.control}
                      type="state"
                      placeholder="ex: NY"
                    />
                    <CustomField
                      label="Postal Code"
                      control={form.control}
                      type="postalCode"
                      placeholder="ex: 400001"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomField
                      label="Date of Birth"
                      control={form.control}
                      type="dateOfBirth"
                      placeholder="yyyy-mm-dd"
                    />
                    <CustomField
                      label="Aadhar No"
                      control={form.control}
                      type="aadharNo"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </>
              )}

              <CustomField
                label="Email"
                type="email"
                control={form.control}
                placeholder="Enter your email"
              />
              <CustomField
                label="Password"
                type="password"
                control={form.control}
                placeholder="Enter your password"
              />

              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      &nbsp; Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign-in"
                  ) : (
                    "Sign-up"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account ?"
                : "Already have an account ?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up " : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
