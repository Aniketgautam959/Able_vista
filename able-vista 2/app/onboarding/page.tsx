"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const formSchema = z.object({
    bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
    interests: z.string().min(1, "Please enter at least one interest"),
    learningGoal: z.string().max(200, "Goal must not exceed 200 characters").optional(),
    skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
    preferredLearningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]),
});

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bio: "",
            interests: "",
            learningGoal: "",
            skillLevel: "beginner",
            preferredLearningStyle: "visual",
        },
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/showme");
                if (!response.ok) {
                    router.push("/login");
                    return;
                }
                const data = await response.json();
                if (data.user) {
                    setUserId(data.user._id);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userId) return;

        try {
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    ...values,
                    interests: values.interests.split(",").map((i) => i.trim()).filter(Boolean),
                }),
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                router.push("/dashboard"); // Redirect to dashboard after onboarding
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Onboarding submission error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome! Let's get to know you
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Help us personalize your learning experience
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us a little about yourself..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interests"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interests</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="React, AI, Design (comma separated)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Separate multiple interests with commas.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="learningGoal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Learning Goal</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Become a Full Stack Developer"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="skillLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Skill Level</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="preferredLearningStyle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Learning Style</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your style" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="visual">Visual (Videos, Diagrams)</SelectItem>
                                                <SelectItem value="auditory">Auditory (Podcasts, Lectures)</SelectItem>
                                                <SelectItem value="reading">Reading (Articles, Books)</SelectItem>
                                                <SelectItem value="kinesthetic">Kinesthetic (Hands-on, Projects)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Complete Profile
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
