package com.flashpage.app.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.model.Cliente;
import com.flashpage.app.model.Domicilio;
import com.flashpage.app.model.EstadoVenta;
import com.flashpage.app.model.Origen;
import com.flashpage.app.model.Pago;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.Venta;
import com.flashpage.app.repository.VentaRepository;
import com.flashpage.app.repository.VentaSpecification;

@Service
@Transactional
public class ReporteService {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String[] HEADERS = {
            "Fecha", "Plaza ID", "Supervisor", "Asesor", "Estado Venta", "Fecha Instalacion",
            "Cliente", "Número de Documento", "Número de Referencia",
            "Calle", "Número calle", "Depto", "Piso", "Entre calles", "Coordenadas",
            "Localidad", "Código Postal", "Cluster",
            "Promo", "Forma Pago", "Banco", "Número de Tarjeta", "Titular de Tarjeta"
    };

    private final VentaRepository ventaRepository;

    public ReporteService(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    public byte[] generarReporteVentas(
            String cliente, String producto, String central,
            Long asesorId, Origen origen, EstadoVenta estado,
            LocalDate desde, LocalDate hasta) throws IOException {

        Specification<Venta> spec = Specification.unrestricted();

        if (estado != null)
            spec = spec.and(VentaSpecification.estado(estado));
        if (cliente != null && !cliente.isBlank())
            spec = spec.and(VentaSpecification.clienteNombreContains(cliente));
        if (producto != null && !producto.isBlank())
            spec = spec.and(VentaSpecification.productoNombreContains(producto));
        if (central != null && !central.isBlank())
            spec = spec.and(VentaSpecification.centralNombreContains(central));
        if (asesorId != null)
            spec = spec.and(VentaSpecification.asesorId(asesorId));
        if (origen != null)
            spec = spec.and(VentaSpecification.origen(origen));
        if (desde != null)
            spec = spec.and(VentaSpecification.creadoDesde(desde));
        if (hasta != null)
            spec = spec.and(VentaSpecification.creadoHasta(hasta));

        List<Venta> ventas = ventaRepository.findAll(spec);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Ventas");
            sheet.setDefaultColumnWidth(20);
            sheet.setDisplayGridlines(false);
            sheet.setPrintGridlines(false);

            CellStyle titleStyle = buildTitleStyle(wb);
            CellStyle subtitleStyle = buildSubtitleStyle(wb);
            CellStyle headerStyle = buildHeaderStyle(wb);
            CellStyle dataStyle = buildDataStyle(wb);
            CellStyle altStyle = buildAltStyle(wb);

            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(32);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Reporte de Ventas");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, HEADERS.length - 1));

            Row subtitleRow = sheet.createRow(1);
            subtitleRow.setHeightInPoints(20);
            Cell subtitleCell = subtitleRow.createCell(0);
            String periodo = (desde != null && hasta != null)
                    ? "Período: " + FECHA_FORMATTER.format(desde) + " — " + FECHA_FORMATTER.format(hasta)
                    : "Reporte completo";
            subtitleCell.setCellValue(periodo + "    •    Total registros: " + ventas.size());
            subtitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, HEADERS.length - 1));

            Row headerRow = sheet.createRow(2);
            headerRow.setHeightInPoints(28);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 3;
            for (Venta v : ventas) {
                Row row = sheet.createRow(rowNum);
                row.setHeightInPoints(20);
                CellStyle style = (rowNum % 2 == 0) ? altStyle : dataStyle;

                Usuario asesor = v.getAsesor();
                Usuario supervisor = asesor != null ? asesor.getSupervisor() : null;
                Cliente cli = v.getCliente();
                Domicilio dom = cli != null ? cli.getDomicilio() : null;
                Pago pago = v.getPago();

                setCell(row, 0, v.getCreadoEn() != null
                        ? FECHA_FORMATTER.format(v.getCreadoEn().atZone(ZoneId.of("America/Argentina/Buenos_Aires")))
                        : "", style);
                setCell(row, 1, supervisor != null && supervisor.getPlazaUsername() != null
                        ? supervisor.getPlazaUsername()
                        : "", style);
                setCell(row, 2, supervisor != null && supervisor.getId() != null
                        ? supervisor.getId().toString()
                        : "", style);
                setCell(row, 3, asesor != null && asesor.getId() != null
                        ? asesor.getId().toString()
                        : "", style);
                setCell(row, 4, v.getEstado() != null ? v.getEstado().name() : "", style);
                setCell(row, 5, "", style);
                setCell(row, 6, cli != null ? cli.getNombre() : "", style);
                setCell(row, 7, cli != null ? cli.getNumeroDocumento() : "", style);
                setCell(row, 8, cli != null ? cli.getTelefono() : "", style);
                setCell(row, 9, dom != null ? dom.getCalle() : "", style);
                setCell(row, 10, dom != null ? dom.getNumero() : "", style);
                setCell(row, 11, dom != null && dom.getDepto() != null ? dom.getDepto() : "", style);
                setCell(row, 12, dom != null && dom.getPiso() != null ? dom.getPiso() : "", style);
                setCell(row, 13, dom != null
                        ? String.join(" - ",
                                dom.getEntreCalles1() != null ? dom.getEntreCalles1() : "",
                                dom.getEntreCalles2() != null ? dom.getEntreCalles2() : "",
                                dom.getEntreCalles3() != null ? dom.getEntreCalles3() : "")
                        : "", style);
                setCell(row, 14, dom != null && dom.getCoordenadas() != null ? dom.getCoordenadas() : "", style);
                setCell(row, 15, dom != null ? dom.getLocalidad() : "", style);
                setCell(row, 16, dom != null ? dom.getCodigoPostal() : "", style);
                setCell(row, 17, "", style);
                setCell(row, 18, v.getPromo() != null ? v.getPromo().getNombre() : "", style);
                setCell(row, 19, pago != null
                        ? (Boolean.TRUE.equals(pago.getDebitoAutomatico())
                                ? "Débito Automático"
                                : (pago.getTipoTarjeta() != null ? pago.getTipoTarjeta().name() : ""))
                        : "", style);
                setCell(row, 20, pago != null ? pago.getBanco() : "", style);
                setCell(row, 21, pago != null ? pago.getNumeroTarjeta() : "", style);
                setCell(row, 22, pago != null ? pago.getTitular() : "", style);

                rowNum++;
            }

            sheet.createFreezePane(0, 3);
            if (!ventas.isEmpty()) {
                sheet.setAutoFilter(new CellRangeAddress(2, rowNum - 1, 0, HEADERS.length - 1));
            }
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
                int width = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(width + 1024, 16000));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    // Paleta tomada del CRM: indigo-600, blue-600, neutrales tailwind.
    private static final byte[] INDIGO_600 = hex("4F46E5");
    private static final byte[] NEUTRAL_900 = hex("171717");
    private static final byte[] NEUTRAL_500 = hex("737373");
    private static final byte[] NEUTRAL_200 = hex("E5E5E5");
    private static final byte[] NEUTRAL_50 = hex("FAFAFA");
    private static final byte[] WHITE = hex("FFFFFF");

    private static byte[] hex(String h) {
        return new byte[] {
                (byte) Integer.parseInt(h.substring(0, 2), 16),
                (byte) Integer.parseInt(h.substring(2, 4), 16),
                (byte) Integer.parseInt(h.substring(4, 6), 16)
        };
    }

    private XSSFCellStyle buildTitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 18);
        font.setFontName("Calibri");
        ((org.apache.poi.xssf.usermodel.XSSFFont) font).setColor(new XSSFColor(NEUTRAL_900, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private XSSFCellStyle buildSubtitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Calibri");
        ((org.apache.poi.xssf.usermodel.XSSFFont) font).setColor(new XSSFColor(NEUTRAL_500, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private XSSFCellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Calibri");
        ((org.apache.poi.xssf.usermodel.XSSFFont) font).setColor(new XSSFColor(WHITE, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(INDIGO_600, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        applyBorder(style);
        return style;
    }

    private XSSFCellStyle buildDataStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Calibri");
        ((org.apache.poi.xssf.usermodel.XSSFFont) font).setColor(new XSSFColor(NEUTRAL_900, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(WHITE, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(style);
        return style;
    }

    private XSSFCellStyle buildAltStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Calibri");
        ((org.apache.poi.xssf.usermodel.XSSFFont) font).setColor(new XSSFColor(NEUTRAL_900, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(NEUTRAL_50, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(style);
        return style;
    }

    private void applyBorder(XSSFCellStyle style) {
        XSSFColor border = new XSSFColor(NEUTRAL_200, null);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBottomBorderColor(border);
        style.setTopBorderColor(border);
        style.setLeftBorderColor(border);
        style.setRightBorderColor(border);
    }
}
