import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const initialProfile = {
  name: "Robert Grabiński",
  team: "Kasza GO",
  club: "Automobiklub Karkonosze",
  birthDate: "14.02.1985",
  drivingLicenseNumber: "00161/04/0261",
  sportsLicense: false,
  email: "robert.grabinski@example.com",
  phone: "535850214",
  iceContact: {
    name: "Joanna Kaszowska",
    phone: "51322044",
  },
};

type Profile = typeof initialProfile;

export default function YourProfile() {
  const [profile, setProfile] = useState<Profile>(initialProfile);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: call API / mutate store here.
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

      <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => handleInput("name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="team">Zespół</Label>
            <Input
              id="team"
              value={profile.team}
              onChange={(e) => handleInput("team", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="club">Klub</Label>
            <Input
              id="club"
              value={profile.club}
              onChange={(e) => handleInput("club", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="birthDate">Data urodzenia</Label>
            <Input
              id="birthDate"
              value={profile.birthDate}
              onChange={(e) => handleInput("birthDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="drivingLicenseNumber">Numer prawa jazdy</Label>
            <Input
              id="drivingLicenseNumber"
              value={profile.drivingLicenseNumber}
              onChange={(e) =>
                handleInput("drivingLicenseNumber", e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="sportsLicense"
              checked={profile.sportsLicense}
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
              value={profile.email}
              onChange={(e) => handleInput("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleInput("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="iceName">ICE - osoba do kontaktu</Label>
            <Input
              id="iceName"
              value={profile.iceContact.name}
              onChange={(e) => handleIceInput("name", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="icePhone">ICE - telefon</Label>
            <Input
              id="icePhone"
              value={profile.iceContact.phone}
              onChange={(e) => handleIceInput("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" variant="default">
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </motion.article>
  );
}
