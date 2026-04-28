//src/middlewares/roleMiddleware.js
// Middleware para verificar roles
export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        message: "No autenticado",
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(" o ")}`,
      });
    }

    next();
  };
};

// Middleware para verificar si es admin
export const esAdmin = verificarRol(["admin"]);

// Middleware para verificar si es barbero o admin
export const esBarberoOAdmin = verificarRol(["barbero", "admin"]);
