import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State, City } from "country-state-city";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { addressSchema, type AddressFormData } from "@/lib/validations/auth";
import type { DeliveryAddress } from "@/types/user";
import { APP_CONFIG } from "@/config/constants";

type StateOption = {
  name: string;
  isoCode: string;
};

type CityOption = {
  name: string;
};

export function AddressManagement() {
  const { profile, updateAddresses } = useAuth();

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      pincode: "",
      country: APP_CONFIG.DEFAULT_COUNTRY,
      state: "",
      city: "",
      fullAddress: "",
      landmark: "",
    },
  });

  const watchStateName = addressForm.watch("state");
  const inStates = State.getStatesOfCountry(APP_CONFIG.DEFAULT_COUNTRY_ISO) as StateOption[];
  const selectedStateObj = inStates.find(
    (stateOption) => stateOption.name === watchStateName
  );
  const cities = selectedStateObj
    ? (City.getCitiesOfState(APP_CONFIG.DEFAULT_COUNTRY_ISO, selectedStateObj.isoCode) as CityOption[])
    : [];

  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const newAddress: DeliveryAddress = {
        id: crypto.randomUUID(),
        pincode: data.pincode,
        country: data.country,
        state: data.state,
        city: data.city,
        fullAddress: data.fullAddress,
        landmark: data.landmark || "",
      };
      const currentAddresses = profile?.addresses || [];
      await updateAddresses([...currentAddresses, newAddress]);
    },
    onSuccess: () => {
      toast.success("Address saved successfully!");
      addressForm.reset();
    },
    onError: () => {
      toast.error("Failed to save address. Please try again.");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!profile?.addresses) return;
      const updated = profile.addresses.filter((a) => a.id !== id);
      await updateAddresses(updated);
    },
    onSuccess: () => {
      toast.success("Address deleted");
    },
    onError: () => {
      toast.error("Failed to delete address");
    },
  });

  const onAddressSubmit = (data: AddressFormData) => {
    addAddressMutation.mutate(data);
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Saved Delivery Addresses
        </CardTitle>
        <CardDescription>
          Manage your delivery addresses for quick checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* List of existing addresses */}
        <div className="space-y-4 mb-8">
          {profile.addresses && profile.addresses.length > 0 ? (
            profile.addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 border border-border rounded-xl flex justify-between items-start bg-card"
              >
                <div>
                  <p className="font-medium text-sm mb-1">{addr.fullAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  {addr.landmark && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{addr.country}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAddressMutation.mutate(addr.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={deleteAddressMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed rounded-xl bg-secondary/20">
              <p className="text-sm text-muted-foreground">
                No saved addresses found.
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="font-medium mb-4">Add New Address</h3>
          <form
            onSubmit={addressForm.handleSubmit(onAddressSubmit)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="110001"
                  maxLength={6}
                  {...addressForm.register("pincode")}
                />
                {addressForm.formState.errors.pincode && (
                  <p className="text-sm text-destructive">
                    {addressForm.formState.errors.pincode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder={APP_CONFIG.DEFAULT_COUNTRY}
                  {...addressForm.register("country")}
                />
                {addressForm.formState.errors.country && (
                  <p className="text-sm text-destructive">
                    {addressForm.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={watchStateName || ""}
                  onValueChange={(val) => {
                    addressForm.setValue("state", val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    addressForm.setValue("city", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {inStates.map((stateOption) => (
                      <SelectItem
                        key={stateOption.isoCode}
                        value={stateOption.name}
                      >
                        {stateOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addressForm.formState.errors.state && (
                  <p className="text-sm text-destructive">
                    {addressForm.formState.errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select
                  value={addressForm.watch("city") || ""}
                  onValueChange={(val) => {
                    addressForm.setValue("city", val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={!watchStateName || cities.length === 0}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {cities.map((cityOption) => (
                      <SelectItem key={cityOption.name} value={cityOption.name}>
                        {cityOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addressForm.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {addressForm.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Textarea
                id="fullAddress"
                placeholder="House/Flat No., Building, Street, Area"
                rows={3}
                {...addressForm.register("fullAddress")}
              />
              {addressForm.formState.errors.fullAddress && (
                <p className="text-sm text-destructive">
                  {addressForm.formState.errors.fullAddress.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Near metro station, opposite mall, etc."
                {...addressForm.register("landmark")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={addAddressMutation.isPending || !addressForm.formState.isDirty}
              >
                {addAddressMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Address
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
