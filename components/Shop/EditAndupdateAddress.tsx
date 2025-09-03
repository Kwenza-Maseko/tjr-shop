'use client'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    useTransition
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StoreDetailsParams } from "@/types";
import { storeContactDetailsValidation } from "@/lib/validation";
import { createStoreContactDetails } from "@/lib/store/store-contact-details";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


type EditAndupdateAddressParams = {
  contactToEdit?: StoreDetailsParams;
  mode: "create" | "update";
  onSuccess: (contact: StoreDetailsParams, mode: "create" | "update") => void;
};

const EditAndupdateAddress = ({ contactToEdit, mode, onSuccess }: EditAndupdateAddressParams) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof storeContactDetailsValidation>>({
        resolver: zodResolver(storeContactDetailsValidation),
        defaultValues: {
            id: contactToEdit?.id,
            streetAddress: contactToEdit?.streetAddress || "",
            town: contactToEdit?.town || "",
            province: contactToEdit?.province || "",
            storeTelNumber: contactToEdit?.storeTelNumber || "",
            storeEmail: contactToEdit?.storeEmail || "",
        },
    });

    const onSubmit = (values: z.infer<typeof storeContactDetailsValidation>) => {
        startTransition(() => {
            createStoreContactDetails(values)
                .then((res) => {
                    if (!res) {
                        toast.error("No response received");
                        return;
                    }

                    if (res.success && res.data) {
                        toast.success(`Store ${res.action} successfully`);
                        onSuccess(res.data, res.action === "updated" ? "update" : "create");
                    } else {
                        toast.error(res.message || "An error occurred");
                    }
                })
                .catch(() => {
                    toast.error("Failed to submit form");
                });
        });
    };

    return (
        <div className="w-full md:w-96 custom-shadow-box rounded-lg p-6 bg-white">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Street Address */}
                    <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                    <Input className="py-6 bg-[#edededed]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Town */}
                    <FormField
                        control={form.control}
                        name="town"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Town</FormLabel>
                                <FormControl>
                                    <Input className="py-6 bg-[#edededed]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Province */}
                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Province</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className=" py-6 w-full bg-[#edededed]">
                                            <SelectValue placeholder="Select Province" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                                            <SelectItem value="Free State">Free State</SelectItem>
                                            <SelectItem value="Gauteng">Gauteng</SelectItem>
                                            <SelectItem value="KwaZulu Natal">KwaZulu Natal</SelectItem>
                                            <SelectItem value="Limpopo">Limpopo</SelectItem>
                                            <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                                            <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                                            <SelectItem value="North West">North West</SelectItem>
                                            <SelectItem value="Western Cape">Western Cape</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Office Number */}
                    <FormField
                        control={form.control}
                        name="storeTelNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Office Number</FormLabel>
                                <FormControl>
                                    <Input className="py-6 bg-[#edededed]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="storeEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input className="py-6 bg-[#edededed]" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-teal-500 hover:bg-teal-400 py-6"
                    >
                        {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : mode === "update" ? "Update" : "Save"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default EditAndupdateAddress;
