import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NFCProfileBuilder, { type NFCProfileData } from "@/components/NFCProfileBuilder";
import {
  checkUsernameUniqueness,
  generateUsernameSuggestions,
} from "@/lib/publicNfcService";
import { updatePrebookingNFCProfile, type PrebookingRecord } from "@/lib/prebookService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface NFCEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  profileDraft: NFCProfileData;
  setProfileDraft: (data: NFCProfileData) => void;
}

export function NFCEditModal({
  open,
  onOpenChange,
  orderId,
  profileDraft,
  setProfileDraft,
}: NFCEditModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateNFCMutation = useMutation({
    mutationFn: async () => {
      if (!orderId || !user?.uid) throw new Error("Missing order information");

      if (profileDraft.username) {
        const isTaken = await checkUsernameUniqueness(
          profileDraft.username,
          orderId
        );
        if (isTaken) {
          const suggestions = await generateUsernameSuggestions(
            profileDraft.name || profileDraft.username
          );
          throw new Error(
            `This username is already taken. Try: ${suggestions.join(", ")}`
          );
        }
      }

      const orders = queryClient.getQueryData<PrebookingRecord[]>(["userPrebookings", user.uid]) || [];
      const selectedOrder = orders.find((order) => order.id === orderId);

      await updatePrebookingNFCProfile(
        orderId,
        profileDraft,
        selectedOrder?.payment?.orderId
      );

      return { orderId, profileDraft };
    },
    onSuccess: (data) => {
      toast.success("NFC profile updated successfully!");
      if (user?.uid) {
        queryClient.setQueryData<PrebookingRecord[]>(
          ["userPrebookings", user.uid],
          (old) =>
            old?.map((order) =>
              order.id === data.orderId
                ? { ...order, nfcProfile: { ...data.profileDraft } }
                : order
            )
        );
      }
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Failed to update NFC profile. Please try again.";
      toast.error(message);
      console.error("NFC profile save error:", error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit NFC Profile</DialogTitle>
          <DialogDescription>
            Update the NFC profile linked to your purchased NFC card.
          </DialogDescription>
        </DialogHeader>
        <NFCProfileBuilder
          profileData={profileDraft}
          onProfileChange={setProfileDraft}
          onBack={() => onOpenChange(false)}
          onContinue={() => updateNFCMutation.mutate()}
          isLoading={updateNFCMutation.isPending}
          title="Edit Your NFC Profile"
          description="Keep your NFC card profile up to date from your account dashboard."
          infoText="These details power your public NFC page link as pleaseping.me/nfc&lt;username&gt;. Username is globally unique and updates reflect on your live link."
          backLabel="Cancel"
          continueLabel="Save NFC Profile"
          variant="edit"
        />
      </DialogContent>
    </Dialog>
  );
}
