import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PersonForm from "@/components/PersonForm";

export default async function NewPersonPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/persons");

  return <PersonForm />;
}
