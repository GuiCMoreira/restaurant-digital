import { SocketProvider } from "@/providers/SocketProvider";

export default function MesaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { numero: string };
}) {
  return <SocketProvider tableNumber={params.numero}>{children}</SocketProvider>;
}
