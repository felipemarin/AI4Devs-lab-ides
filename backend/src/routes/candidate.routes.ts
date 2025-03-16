import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { Request, Response } from 'express';

const router = Router();
const candidateController = new CandidateController();

// Rutas para candidatos
router.post('/', candidateController.upload.single('resumeFile'), candidateController.createCandidate.bind(candidateController));
router.get('/', candidateController.findAll.bind(candidateController));
router.get('/:id', candidateController.findById.bind(candidateController));
router.put('/:id', candidateController.upload.single('resumeFile'), candidateController.updateCandidate.bind(candidateController));
router.delete('/:id', candidateController.delete.bind(candidateController));

// Rutas para autocompletado
router.get('/suggestions/institutions', candidateController.getInstitutionSuggestions.bind(candidateController));
router.get('/suggestions/degrees', candidateController.getDegreeSuggestions.bind(candidateController));
router.get('/suggestions/fields', candidateController.getFieldSuggestions.bind(candidateController));
router.get('/suggestions/companies', candidateController.getCompanySuggestions.bind(candidateController));
router.get('/suggestions/positions', candidateController.getPositionSuggestions.bind(candidateController));
router.get('/suggestions/skills', candidateController.getSkillSuggestions.bind(candidateController));

// Rutas para agregar elementos individuales
router.post('/:id/work-experiences', candidateController.addWorkExperience.bind(candidateController));
router.put('/:id/work-experiences/:experienceId', candidateController.updateWorkExperience.bind(candidateController));
router.delete('/:id/work-experiences/:experienceId', candidateController.deleteWorkExperience.bind(candidateController));
router.post('/:id/education', candidateController.addEducation.bind(candidateController));
router.put('/:id/education/:educationId', candidateController.updateEducation.bind(candidateController));
router.delete('/:id/education/:educationId', candidateController.deleteEducation.bind(candidateController));
router.post('/:id/skills', candidateController.addSkill.bind(candidateController));
router.put('/:id/skills/:skillName', candidateController.updateSkill.bind(candidateController));
router.delete('/:id/skills/:skillName', candidateController.deleteSkill.bind(candidateController));
router.post('/:id/languages', candidateController.addLanguage.bind(candidateController));
router.put('/:id/languages/:languageId', candidateController.updateLanguage.bind(candidateController));
router.delete('/:id/languages/:languageId', candidateController.deleteLanguage.bind(candidateController));

export default router; 