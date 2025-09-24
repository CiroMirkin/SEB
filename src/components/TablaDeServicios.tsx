import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import type { Servicio } from "../model/service";

export function TablaServicios({ servicios }: { servicios: Servicio[] }) {
  return (
    <Table>
      <TableCaption>Lista de servicios de ambulancia recientes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">N° Parte</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Localidad</TableHead>
          <TableHead>Tipo de Servicio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {servicios.map((servicio) => (
          <TableRow key={servicio.id}>
            <TableCell className="font-medium">{servicio.numeroPartE}</TableCell>
            <TableCell>
              {servicio.fechaPedido}
            </TableCell>
            <TableCell>{servicio.localidad}</TableCell>
            <TableCell>{servicio.tipoServicio}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total de servicios</TableCell>
          <TableCell className="text-right">{servicios.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}