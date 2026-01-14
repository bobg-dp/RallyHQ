import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProfile,
  updateProfile,
  Profile,
} from "@/lib/api/services/profile.service";
import { useAppDispatch } from "@/lib/store";
import { addToast } from "@/lib/store/slices/uiSlice";

const initialProfile: Profile = {
  name: "",
  team: "",
  club: "",
  birthDate: "",
  drivingLicenseNumber: "",
  sportsLicense: false,
  email: "",
  phone: "",
  iceContact: {
    name: "",
    phone: "",
  },
};

export default function YourProfile() {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getProfile();
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        dispatch(
          addToast({
            type: "error",
            message: "Błąd podczas ładowania profilu",
          })
        );
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [dispatch]);

  const handleInput = (field: keyof Profile, value: string | boolean) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIceInput = (
    field: keyof Profile["iceContact"],
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      iceContact: {
        ...prev.iceContact,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateProfile(profile);
      dispatch(
        addToast({
          type: "success",
          message: "Profil został zapisany pomyślnie",
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: "Błąd podczas zapisywania profilu",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.article
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
    >
      <h2 className="text-lg font-semibold mb-4">Twoje dane</h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                value={profile.name ?? ""}
                onChange={(e) => handleInput("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="team">Zespół</Label>
              <Input
                id="team"
                value={profile.team ?? ""}
                onChange={(e) => handleInput("team", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="club">Klub</Label>
              <Input
                id="club"
                value={profile.club ?? ""}
                onChange={(e) => handleInput("club", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="birthDate">Data urodzenia</Label>
              <Input
                id="birthDate"
                value={profile.birthDate ?? ""}
                onChange={(e) => handleInput("birthDate", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="drivingLicenseNumber">Numer prawa jazdy</Label>
              <Input
                id="drivingLicenseNumber"
                value={profile.drivingLicenseNumber ?? ""}
                onChange={(e) =>
                  handleInput("drivingLicenseNumber", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="sportsLicense"
                checked={!!profile.sportsLicense}
                onCheckedChange={(checked) =>
                  handleInput("sportsLicense", Boolean(checked))
                }
              />
              <Label htmlFor="sportsLicense">Posiadam licencję sportową</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email ?? ""}
                onChange={(e) => handleInput("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={profile.phone ?? ""}
                onChange={(e) => handleInput("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="iceName">ICE - osoba do kontaktu</Label>
              <Input
                id="iceName"
                value={profile.iceContact?.name ?? ""}
                onChange={(e) => handleIceInput("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="icePhone">ICE - telefon</Label>
              <Input
                id="icePhone"
                value={profile.iceContact?.phone ?? ""}
                onChange={(e) => handleIceInput("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </form>
      )}
    </motion.article>
  );
}
