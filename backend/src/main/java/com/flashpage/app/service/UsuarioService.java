package com.flashpage.app.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.exception.ConflictException;
import com.flashpage.app.exception.NotFoundException;
import com.flashpage.app.exception.ValidationException;
import com.flashpage.app.model.Rol;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.AsesorOptionResponse;
import com.flashpage.app.model.dto.CreateUsuarioRequest;
import com.flashpage.app.model.dto.UsuarioDetalleResponse;
import com.flashpage.app.model.dto.UsuarioResponse;
import com.flashpage.app.model.dto.UsuarioSupervisorResponse;
import com.flashpage.app.repository.UsuarioRepository;

@Service
@Transactional
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> obtener(Specification<Usuario> spec, int page, int size) {
        return usuarioRepository.findAll(spec, PageRequest.of(page, size, Sort.by("creadoEn").descending()))
                .map(u -> new UsuarioResponse(
                        u.getId(),
                        u.getDni(),
                        u.getNombre(),
                        u.getApellido(),
                        u.getTelefono(),
                        u.getRol(),
                        u.getSupervisor() != null
                                ? new UsuarioSupervisorResponse(u.getSupervisor().getId(),
                                        u.getSupervisor().getNombre(), u.getSupervisor().getApellido())
                                : null,
                        u.isActivo(),
                        u.isRankingOptActivo(),
                        u.getUltimoLogin(),
                        u.getCreadoEn()));
    }

    @Transactional(readOnly = true)
    public UsuarioDetalleResponse obtenerDetalle(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));

        return new UsuarioDetalleResponse(
                u.getDni(),
                null,
                u.getRol(),
                u.getSupervisor() != null ? u.getSupervisor().getId() : null,
                u.getTelefono(),
                u.getNombre(),
                u.getApellido(),
                u.getPlazaUsername(),
                u.getPlazaPassword(),
                u.getUltimoLogin(),
                u.getCreadoEn(),
                u.getActualizadoEn(),
                u.getEmail(),
                u.getGoogleId() != null);
    }

    @Transactional(readOnly = true)
    public List<UsuarioSupervisorResponse> obtenerSupervisores() {
        return usuarioRepository.findByRol(Rol.SUPERVISOR)
                .stream()
                .map(u -> new UsuarioSupervisorResponse(
                        u.getId(),
                        u.getNombre(),
                        u.getApellido()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioSupervisorResponse> obtenerJefesDeSupervisor() {
        return usuarioRepository.findByRol(Rol.JEFE_DE_SUPERVISOR)
                .stream()
                .map(u -> new UsuarioSupervisorResponse(
                        u.getId(),
                        u.getNombre(),
                        u.getApellido()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioSupervisorResponse> obtenerAsesoresDeSupervisor(Long supervisorId) {
        return usuarioRepository.findAsesoresActivosBySuper(supervisorId)
                .stream()
                .map(u -> new UsuarioSupervisorResponse(
                        u.getId(),
                        u.getNombre(),
                        u.getApellido()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AsesorOptionResponse> obtenerAsesores(Long supervisorId) {
        List<Usuario> asesores;
        if (supervisorId != null) {
            asesores = usuarioRepository.findAsesoresActivosBySuper(supervisorId);
        } else {
            asesores = usuarioRepository.findByRolAndActivoTrue(Rol.ASESOR);
        }
        return asesores.stream()
                .map(u -> new AsesorOptionResponse(
                        u.getId(),
                        u.getNombre(),
                        u.getApellido(),
                        u.getSupervisor() != null ? u.getSupervisor().getId() : null))
                .toList();
    }

    public void crear(CreateUsuarioRequest req, Usuario currentUser) {
        if (usuarioRepository.existsByDni(req.dni())) {
            throw new ConflictException("Ya existe un usuario con el DNI: " + req.dni());
        }

        Usuario u = new Usuario();
        u.setDni(req.dni());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRol(req.rol());
        u.setTelefono(req.telefono());
        u.setNombre(req.nombre());
        u.setApellido(req.apellido());

        u.setRankingOptActivo(req.rol() == Rol.ASESOR);

        if (req.rol() == Rol.SUPERVISOR) {
            if (req.plazaUsername() == null || req.plazaUsername().isBlank()
                    || req.plazaPassword() == null || req.plazaPassword().isBlank()) {
                throw new ValidationException(
                        "Debe proveer usuario y contraseña de plaza para el supervisor");
            }
            u.setPlazaUsername(req.plazaUsername());
            u.setPlazaPassword(req.plazaPassword());
        } else if (req.plazaUsername() != null || req.plazaPassword() != null) {
            throw new ValidationException(
                    "Solo los usuarios con rol Supervisor pueden tener credenciales de plaza");
        }

        if (req.rol() == Rol.ASESOR || req.rol() == Rol.SUPERVISOR) {
            Long supervisorIdReq = req.supervisorId();

            // Un SUPERVISOR creando un ASESOR se asigna a sí mismo automáticamente
            final Long supervisorId = (supervisorIdReq == null && req.rol() == Rol.ASESOR
                    && currentUser != null && currentUser.getRol() == Rol.SUPERVISOR)
                            ? currentUser.getId()
                            : supervisorIdReq;

            if (supervisorId == null) {
                throw new ValidationException(req.rol() == Rol.ASESOR
                        ? "Debe seleccionar un supervisor para el asesor"
                        : "Debe seleccionar un jefe de supervisor para el supervisor");
            }
            Usuario supervisor = usuarioRepository.findById(supervisorId)
                    .orElseThrow(() -> new NotFoundException("Supervisor no encontrado con id: " + supervisorId));
            validarRolSupervisor(req.rol(), supervisor.getRol());
            u.setSupervisor(supervisor);
        } else if (req.supervisorId() != null) {
            throw new ValidationException(
                    "Solo los usuarios con rol Asesor o Supervisor pueden tener un supervisor asignado");
        }

        usuarioRepository.save(u);
        log.info("Usuario creado - dni: {}, rol: {}, telefono: {}", req.dni(), req.rol(), req.telefono());
    }

    public void modificar(Long id, UsuarioDetalleResponse req) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));

        if (req.password() != null && !req.password().isBlank()) {
            if (req.password().length() < 8) {
                throw new ValidationException("La contraseña debe tener al menos 8 caracteres");
            }
            u.setPassword(passwordEncoder.encode(req.password()));
        }

        if (req.dni() != null) {
            if (!req.dni().equals(u.getDni()) && usuarioRepository.existsByDni(req.dni())) {
                throw new ConflictException("Ya existe un usuario con el DNI: " + req.dni());
            }
            u.setDni(req.dni());
        }

        if (req.telefono() != null)
            u.setTelefono(req.telefono());

        if (req.nombre() != null)
            u.setNombre(req.nombre());

        if (req.apellido() != null)
            u.setApellido(req.apellido());

        Rol rolAnterior = u.getRol();
        Rol rolEfectivo = req.rol() != null ? req.rol() : rolAnterior;
        boolean cambioDeRol = req.rol() != null && req.rol() != rolAnterior;

        if (cambioDeRol && esRolConSubordinados(rolAnterior)) {
            long subordinados = usuarioRepository.countSubordinadosActivos(id);
            if (subordinados > 0) {
                throw new ConflictException(String.format(
                        "No se puede cambiar el rol: el usuario tiene %d subordinado(s) activo(s). Reasignelos primero.",
                        subordinados));
            }
        }

        if (cambioDeRol) {
            u.setRol(rolEfectivo);
            u.setRankingOptActivo(rolEfectivo == Rol.ASESOR);
        }

        if (rolEfectivo == Rol.SUPERVISOR) {
            String plazaUser = req.plazaUsername() != null ? req.plazaUsername() : u.getPlazaUsername();
            String plazaPass = req.plazaPassword() != null ? req.plazaPassword() : u.getPlazaPassword();
            if (plazaUser == null || plazaUser.isBlank() || plazaPass == null || plazaPass.isBlank()) {
                throw new ValidationException(
                        "Debe proveer usuario y contraseña de plaza para el supervisor");
            }
            u.setPlazaUsername(plazaUser);
            u.setPlazaPassword(plazaPass);
        } else {
            if (req.plazaUsername() != null || req.plazaPassword() != null) {
                throw new ValidationException(
                        "Solo los usuarios con rol Supervisor pueden tener credenciales de plaza");
            }
            u.setPlazaUsername(null);
            u.setPlazaPassword(null);
        }

        if (rolEfectivo == Rol.ASESOR || rolEfectivo == Rol.SUPERVISOR) {
            if (req.supervisorId() != null) {
                Usuario supervisor = usuarioRepository.findById(req.supervisorId())
                        .orElseThrow(() -> new NotFoundException(
                                "Supervisor no encontrado con id: " + req.supervisorId()));
                validarRolSupervisor(rolEfectivo, supervisor.getRol());
                u.setSupervisor(supervisor);
            } else if (cambioDeRol) {
                // Role changed to ASESOR/SUPERVISOR but no supervisor provided — caller must
                // supply one
                throw new ValidationException(rolEfectivo == Rol.ASESOR
                        ? "Debe seleccionar un supervisor para el asesor"
                        : "Debe seleccionar un jefe de supervisor para el supervisor");
            }
            // No role change and no supervisorId sent: editor may lack permission to assign
            // supervisor, keep existing value
        } else {
            if (req.supervisorId() != null) {
                throw new ValidationException(
                        "Solo los usuarios con rol Asesor o Supervisor pueden tener un supervisor asignado");
            }
            u.setSupervisor(null);
        }

        usuarioRepository.save(u);
        log.info("Usuario modificado - id: {}", id);
    }

    private boolean esRolConSubordinados(Rol rol) {
        return rol == Rol.SUPERVISOR || rol == Rol.JEFE_DE_SUPERVISOR;
    }

    private void validarRolSupervisor(Rol rolUsuario, Rol rolSupervisor) {
        if (rolUsuario == Rol.ASESOR && rolSupervisor != Rol.SUPERVISOR) {
            throw new ValidationException(
                    "Un asesor solo puede tener como supervisor a un usuario con rol Supervisor");
        }
        if (rolUsuario == Rol.SUPERVISOR && rolSupervisor != Rol.JEFE_DE_SUPERVISOR) {
            throw new ValidationException(
                    "Un supervisor solo puede tener como supervisor a un usuario con rol Jefe de Supervisor");
        }
    }

    public void activar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));

        u.setActivo(true);
        u.setRankingOptActivo(u.getRol() == Rol.ASESOR);

        usuarioRepository.save(u);
        log.info("Usuario activado - id: {}", id);
    }

    public void desactivar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con id: " + id));

        u.setActivo(false);
        u.setRankingOptActivo(false);

        usuarioRepository.save(u);
        log.info("Usuario desactivado - id: {}", id);
    }
}
