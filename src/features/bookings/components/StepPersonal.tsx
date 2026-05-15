import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalSchema, type PersonalData } from "../schemas/booking";
export function StepPersonal({
  onNext,
  onBack,
}: {
  onNext: (d: PersonalData) => void;
  onBack: () => void;
}) {
  const [preview, setPreview] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalData>({ resolver: zodResolver(personalSchema) });
  const photo = register("photo");
  return (
    <form className="form" onSubmit={handleSubmit(onNext)}>
      <h2>Personal info</h2>
      <input placeholder="Name" {...register("name")} />
      <small>{errors.name?.message}</small>
      <input placeholder="Email" {...register("email")} />
      <small>{errors.email?.message}</small>
      <input placeholder="Phone" {...register("phone")} />
      <small>{errors.phone?.message}</small>
      <input
        type="file"
        accept="image/*"
        name={photo.name}
        ref={photo.ref}
        onBlur={photo.onBlur}
        onChange={(e) => {
          photo.onChange(e);
          const f = e.target.files?.[0];
          if (f) setPreview(URL.createObjectURL(f));
        }}
      />
      {preview && <img className="preview" src={preview} alt="Preview" />}
      <small>{String(errors.photo?.message ?? "")}</small>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button>Continue</button>
    </form>
  );
}
