import { Request, Response } from 'express';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateDto, UpdateCandidateDto, CreateWorkExperienceDto, CreateEducationDto, CreateLanguageDto } from '../types/candidate';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const candidateService = new CandidateService();

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

export class CandidateController {
  public upload = upload;
  private candidateService: CandidateService;

  constructor() {
    this.candidateService = new CandidateService();
  }

  async create(req: Request, res: Response) {
    try {
      const candidateData: CreateCandidateDto = req.body;
      console.log('Received data:', JSON.stringify(candidateData, null, 2));
      const candidate = await this.candidateService.create(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(400).json({ 
        error: 'Error creating candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const candidates = await this.candidateService.findAll();
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ 
        error: 'Error fetching candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const candidate = await this.candidateService.findById(id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      res.status(500).json({ 
        error: 'Error fetching candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateCandidateDto = req.body;
      const candidate = await this.candidateService.update(id, updateData);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(400).json({ 
        error: 'Error updating candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.candidateService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ 
        error: 'Error deleting candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addWorkExperience(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const workExperience: CreateWorkExperienceDto = req.body;
      const result = await this.candidateService.addWorkExperience(candidateId, workExperience);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding work experience:', error);
      res.status(400).json({ 
        error: 'Error adding work experience',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addEducation(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const education: CreateEducationDto = req.body;
      const result = await this.candidateService.addEducation(candidateId, education);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding education:', error);
      res.status(400).json({ 
        error: 'Error adding education',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addSkill(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const { skillName } = req.body;
      const result = await this.candidateService.addSkill(candidateId, skillName);
      res.json(result);
    } catch (error) {
      console.error('Error adding skill:', error);
      res.status(400).json({ 
        error: 'Error adding skill',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addLanguage(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const language: CreateLanguageDto = req.body;
      const result = await this.candidateService.addLanguage(candidateId, language);
      res.json(result);
    } catch (error) {
      console.error('Error adding language:', error);
      res.status(400).json({ 
        error: 'Error adding language',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateWorkExperience(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const experienceId = parseInt(req.params.experienceId);
      const workExperience: CreateWorkExperienceDto = req.body;
      const result = await this.candidateService.updateWorkExperience(candidateId, experienceId, workExperience);
      res.json(result);
    } catch (error) {
      console.error('Error updating work experience:', error);
      res.status(400).json({ 
        error: 'Error updating work experience',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteWorkExperience(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const experienceId = parseInt(req.params.experienceId);
      await this.candidateService.deleteWorkExperience(candidateId, experienceId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting work experience:', error);
      res.status(400).json({ 
        error: 'Error deleting work experience',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateEducation(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const educationId = parseInt(req.params.educationId);
      const education: CreateEducationDto = req.body;
      const result = await this.candidateService.updateEducation(candidateId, educationId, education);
      res.json(result);
    } catch (error) {
      console.error('Error updating education:', error);
      res.status(400).json({ 
        error: 'Error updating education',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateSkill(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const oldSkillName = req.params.skillName;
      const { skillName } = req.body;
      const result = await this.candidateService.updateSkill(candidateId, oldSkillName, skillName);
      res.json(result);
    } catch (error) {
      console.error('Error updating skill:', error);
      res.status(400).json({ 
        error: 'Error updating skill',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateLanguage(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const languageId = parseInt(req.params.languageId);
      const language: CreateLanguageDto = req.body;
      const result = await this.candidateService.updateLanguage(candidateId, languageId, language);
      res.json(result);
    } catch (error) {
      console.error('Error updating language:', error);
      res.status(400).json({ 
        error: 'Error updating language',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteEducation(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const educationId = parseInt(req.params.educationId);
      await this.candidateService.deleteEducation(candidateId, educationId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting education:', error);
      res.status(400).json({ 
        error: 'Error deleting education',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteSkill(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const skillName = req.params.skillName;
      await this.candidateService.deleteSkill(candidateId, skillName);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting skill:', error);
      res.status(400).json({ 
        error: 'Error deleting skill',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteLanguage(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const languageId = parseInt(req.params.languageId);
      await this.candidateService.deleteLanguage(candidateId, languageId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting language:', error);
      res.status(400).json({ 
        error: 'Error deleting language',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createCandidate(req: Request, res: Response) {
    try {
      const candidateData = req.body;
      if (req.file) {
        candidateData.resumeUrl = `/uploads/${req.file.filename}`;
      }
      const candidate = await this.candidateService.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(400).json({ 
        error: 'Error creating candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateCandidate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidateData = req.body;
      if (req.file) {
        candidateData.resumeUrl = `/uploads/${req.file.filename}`;
      }
      const candidate = await this.candidateService.updateCandidate(Number(id), candidateData);
      res.json(candidate);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error updating candidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getInstitutionSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await candidateService.getInstitutionSuggestions(query);
      res.json(suggestions.map(s => s.institution));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching institution suggestions' });
    }
  }

  async getDegreeSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await candidateService.getDegreeSuggestions(query);
      res.json(suggestions.map(s => s.degree));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching degree suggestions' });
    }
  }

  async getFieldSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await candidateService.getFieldSuggestions(query);
      res.json(suggestions.map(s => s.field));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching field suggestions' });
    }
  }

  async getCompanySuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await candidateService.getCompanySuggestions(query);
      res.json(suggestions.map(s => s.company));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching company suggestions' });
    }
  }

  async getPositionSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await candidateService.getPositionSuggestions(query);
      res.json(suggestions.map(s => s.position));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching position suggestions' });
    }
  }

  async getSkillSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const suggestions = await this.candidateService.getSkillSuggestions(query);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching skill suggestions:', error);
      res.status(500).json({ error: 'Error fetching skill suggestions' });
    }
  }
} 