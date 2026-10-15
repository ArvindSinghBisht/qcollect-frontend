import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserCreateFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export const emptyUserCreateForm: UserCreateFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export function UserCreateFields({
  value,
  onChange,
}: {
  value: UserCreateFormState;
  onChange: (value: UserCreateFormState) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <Label>First Name</Label>
        <Input value={value.firstName} onChange={(event) => onChange({ ...value, firstName: event.target.value })} />
      </label>
      <label className="space-y-2">
        <Label>Last Name</Label>
        <Input value={value.lastName} onChange={(event) => onChange({ ...value, lastName: event.target.value })} />
      </label>
      <label className="space-y-2 md:col-span-2">
        <Label>Email</Label>
        <Input type="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} />
      </label>
      <label className="space-y-2">
        <Label>Phone</Label>
        <Input value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} />
      </label>
      <label className="space-y-2">
        <Label>Password</Label>
        <Input type="password" value={value.password} onChange={(event) => onChange({ ...value, password: event.target.value })} />
      </label>
    </div>
  );
}
