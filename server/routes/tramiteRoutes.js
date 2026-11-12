import express from "express";
import authenticate from "../middleware/authenticate.js";
import { cancelarTramite, crearTramite, getDisponibilidad, getMisTramites, getOficinas, getRequisitos, getSecciones, getTipos } from "../controllers/tramiteController.js";

const router = express.Router();
router.get("/secciones", getSecciones);
router.get("/tipos/:seccionId", getTipos);
router.get("/oficinas/:seccionId", getOficinas);
router.get("/requisitos/:tipoId", getRequisitos);
router.get("/disponibilidad", getDisponibilidad);
router.post("/", authenticate, crearTramite);
router.get("/mis", authenticate, getMisTramites);
router.post("/:id/cancelar", authenticate, cancelarTramite);
export default router;
