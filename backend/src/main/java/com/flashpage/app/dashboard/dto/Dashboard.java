package com.flashpage.app.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardAdmin;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardAsesor;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardGerente;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardJefeSupervisor;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardLider;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardSupervisor;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = DashboardAsesor.class, name = "ASESOR"),
    @JsonSubTypes.Type(value = DashboardSupervisor.class, name = "SUPERVISOR"),
    @JsonSubTypes.Type(value = DashboardJefeSupervisor.class, name = "JEFE_DE_SUPERVISOR"),
    @JsonSubTypes.Type(value = DashboardGerente.class, name = "GERENTE"),
    @JsonSubTypes.Type(value = DashboardLider.class, name = "LIDER"),
    @JsonSubTypes.Type(value = DashboardAdmin.class, name = "ADMINISTRACION_RRHH_COBRANZA")
})
public sealed interface Dashboard
        permits DashboardAsesor, DashboardSupervisor, DashboardJefeSupervisor,
        DashboardGerente, DashboardLider, DashboardAdmin {
}
